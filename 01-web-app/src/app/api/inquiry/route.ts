import { NextResponse } from "next/server";
import {
  localPipelineConfigured,
  runLocalInquiryPipeline,
  type InquiryPayload,
} from "@/lib/pipeline";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const mode = (process.env.INQUIRY_PIPELINE || "auto").toLowerCase();
  const webhook = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  const payload = body as InquiryPayload;

  async function runLocal() {
    const result = await runLocalInquiryPipeline(payload);
    return NextResponse.json(result);
  }

  // Explicit local automation (written in-repo; mirrors n8n)
  if (mode === "local") {
    if (!localPipelineConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "INQUIRY_PIPELINE=local but OpenAI / Supabase service_role (eyJ…) env missing in 01-web-app",
        },
        { status: 500 },
      );
    }
    try {
      return await runLocal();
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "Local pipeline failed" },
        { status: 500 },
      );
    }
  }

  // n8n-only mode
  if (mode === "n8n") {
    if (!webhook) {
      return NextResponse.json({ ok: false, error: "N8N_WEBHOOK_URL not set" }, { status: 500 });
    }
  }

  // Prefer n8n when configured; on failure/404 fall back to local automation
  if (webhook && mode !== "local") {
    try {
      const upstream = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const text = await upstream.text();
      let data: Record<string, unknown> = {};
      try {
        data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
      } catch {
        data = { raw: text };
      }

      if (upstream.ok) {
        return NextResponse.json({
          ok: true,
          mode: "n8n",
          reference: (data.reference as string) || (data.Reference as string) || "AC-PENDING",
          lead_id: data.lead_id,
          summary: data.summary,
          ...data,
        });
      }

      // auto: fall through to local if available
      if (mode === "n8n" || !localPipelineConfigured()) {
        return NextResponse.json(
          {
            ok: false,
            error: (data.error as string) || `Webhook failed (${upstream.status})`,
            hint:
              upstream.status === 404
                ? "Activate the workflow in n8n Cloud, or set INQUIRY_PIPELINE=local"
                : undefined,
          },
          { status: 502 },
        );
      }
    } catch (err) {
      if (mode === "n8n" || !localPipelineConfigured()) {
        return NextResponse.json(
          {
            ok: false,
            error: err instanceof Error ? err.message : "Webhook unreachable",
          },
          { status: 502 },
        );
      }
    }
  }

  if (localPipelineConfigured()) {
    try {
      return await runLocal();
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "Local pipeline failed" },
        { status: 500 },
      );
    }
  }

  // Last-resort stub (UI only)
  const submissionId =
    typeof payload?.submission_id === "string" ? payload.submission_id : "local";
  const ref = `AC-${String(10000 + (submissionId.length * 17) % 90000)}`;
  return NextResponse.json({
    ok: true,
    reference: ref,
    mode: "stub",
    message:
      "Stub only — set SUPABASE_SERVICE_ROLE_KEY (eyJ…) + OPENAI_API_KEY in 01-web-app/.env.local, or activate n8n.",
  });
}
