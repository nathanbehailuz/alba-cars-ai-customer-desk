import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const webhook = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

  if (!webhook) {
    // Local / pre-n8n stub so the UI is demoable
    const submissionId =
      typeof body === "object" &&
      body &&
      "submission_id" in body &&
      typeof (body as { submission_id: unknown }).submission_id === "string"
        ? (body as { submission_id: string }).submission_id
        : "local";
    const ref = `AC-${String(10000 + (submissionId.length * 17) % 90000)}`;
    return NextResponse.json({
      ok: true,
      reference: ref,
      mode: "stub",
      message: "N8N_WEBHOOK_URL not set — stub confirmation for local UI testing.",
    });
  }

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

    if (!upstream.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: (data.error as string) || `Webhook failed (${upstream.status})`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      reference: (data.reference as string) || (data.Reference as string) || "AC-PENDING",
      lead_id: data.lead_id,
      summary: data.summary,
      ...data,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Webhook unreachable",
      },
      { status: 502 },
    );
  }
}
