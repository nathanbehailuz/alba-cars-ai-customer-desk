#!/usr/bin/env node
/**
 * Local / CI-friendly runner that mirrors the n8n inquiry pipeline.
 * Use for AI sample evaluation when n8n Cloud credentials are not yet wired.
 *
 * Usage (from repo root):
 *   export OPENAI_API_KEY=...
 *   export NEXT_PUBLIC_SUPABASE_URL=...
 *   export SUPABASE_SERVICE_ROLE_KEY=...
 *   node 03-n8n-workflow/scripts/run-samples.mjs
 *   node 03-n8n-workflow/scripts/run-samples.mjs --file sample-payloads/01-high-intent-rav4.json
 *
 * Never commit real secrets.
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const samplesDir = join(root, "sample-payloads");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-5-nano";
const APPOINTMENT_URL = process.env.APPOINTMENT_URL || "https://example.com/book";

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const SYSTEM = `You are ALBA CARS lead qualification AI. Return ONLY valid JSON with keys:
category, summary, vehicle (object), buying_timeline, buying_intent, urgency,
lead_score (0-100), recommended_action, recommended_cta, voice_agent_eligible (boolean),
customer_confirmation, sales_brief.
Categories: vehicle_purchase, vehicle_search, test_drive, financing, trade_in, vehicle_sale, general_sales_question, spam.
Currency AED. Brand voice: professional Dubai dealership.

customer_confirmation MUST follow this structure (plain text, not markdown):
1) Thank them for reaching out to ALBA CARS (use their first name if provided).
2) Say we have noted their interest, in plain language based on the inquiry (e.g. buy a car, trade-in, sell their vehicle, book a test drive, financing, find a car, or a general question) and include 1–2 concrete details from their message (model, budget, timeline).
3) End with one clear action item — what ALBA will do next (advisor follow-up, share appointment link ${APPOINTMENT_URL}, expect a call, etc.).
Keep under ~120 words. If a reference like AC-##### is in the payload, mention it once.`;

async function sb(path, { method = "GET", body, prefer } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: prefer || (method === "POST" ? "return=representation" : "return=minimal"),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${method} ${path}: ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

function priorityFromScore(score) {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "early";
}

function interestPhrase(payload) {
  const intent = String(payload.intent || payload.category_seed || "").toLowerCase();
  const map = {
    buy: "buy a vehicle",
    vehicle_purchase: "buy a vehicle",
    sell: "sell your vehicle",
    vehicle_sale: "sell your vehicle",
    trade_in: "trade in your vehicle",
    test_drive: "book a test drive",
    financing: "explore financing",
    find: "find a vehicle",
    vehicle_search: "find a vehicle",
    question: "ask a question",
    general_sales_question: "ask a question",
  };
  return map[intent] || "get help from our team";
}

function draftFallbackConfirmation(payload, reference) {
  const name = (payload.name || "").trim().split(/\s+/)[0];
  const hello = name ? `Hi ${name},` : "Hi,";
  const detail = (payload.message || "").trim();
  const detailBit = detail
    ? ` Details we captured: "${detail.slice(0, 140)}${detail.length > 140 ? "…" : ""}".`
    : "";
  return `${hello} thanks for reaching out to ALBA CARS! We have noted your interest to ${interestPhrase(payload)}.${detailBit} Next step: a sales advisor will review your request and follow up shortly. You can also book here: ${APPOINTMENT_URL}. Your reference is ${reference}.`;
}

function validate(payload) {
  if (!payload?.submission_id) return "submission_id required";
  if (!payload.email && !payload.phone) return "email or phone required";
  if (!payload.contact_consent) return "contact_consent required";
  const ch = payload.preferred_channel;
  if ((ch === "whatsapp" || ch === "both") && !payload.phone) return "phone required for WhatsApp";
  if ((ch === "email" || ch === "both") && !payload.email) return "email required for email channel";
  return null;
}

async function classify(payload) {
  const started = Date.now();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  const raw = data.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);
  return { parsed, latency_ms: Date.now() - started, model: MODEL };
}

async function processOne(sample, { evalOnly = false } = {}) {
  const scenario_key = sample.name || "unnamed";
  const payload = sample.payload || sample;
  const err = validate(payload);
  if (err) throw new Error(err);

  await sb("alba_processing_log", {
    method: "POST",
    body: {
      submission_id: payload.submission_id,
      workflow_run_id: `local-${Date.now()}`,
      status: "processing",
    },
  });

  const existing = await sb(
    `alba_leads?submission_id=eq.${payload.submission_id}&select=id,reference`,
  );
  if (existing?.length) {
    console.log(`[skip duplicate] ${scenario_key} → ${existing[0].reference}`);
    return existing[0];
  }

  const { parsed, latency_ms, model } = await classify(payload);

  // Deterministic voice gate
  const voiceEligible =
    Boolean(parsed.voice_agent_eligible) &&
    Boolean(payload.phone) &&
    Boolean(payload.voice_consent);

  const score = Number(parsed.lead_score) || 0;
  const priority = priorityFromScore(score);

  await sb("alba_ai_eval_runs", {
    method: "POST",
    body: {
      scenario_key,
      input_payload: payload,
      model,
      output_json: { ...parsed, voice_agent_eligible: voiceEligible },
      latency_ms,
      notes: evalOnly ? "eval-only run" : "full pipeline",
    },
  });

  if (evalOnly) {
    console.log(`[eval] ${scenario_key} score=${score} category=${parsed.category}`);
    return { reference: null, eval: true };
  }

  // Upsert customer (simple: insert or find)
  let customerId;
  const filter = payload.email
    ? `email=eq.${encodeURIComponent(payload.email)}`
    : `phone=eq.${encodeURIComponent(payload.phone)}`;
  const found = await sb(`alba_customers?${filter}&select=id`);
  if (found?.length) {
    customerId = found[0].id;
    await sb(`alba_customers?id=eq.${customerId}`, {
      method: "PATCH",
      body: {
        name: payload.name ?? undefined,
        last_contact_at: new Date().toISOString(),
        preferred_channel: payload.preferred_channel,
        contact_consent: payload.contact_consent,
        whatsapp_consent: payload.whatsapp_consent,
        voice_consent: payload.voice_consent,
      },
      prefer: "return=minimal",
    });
  } else {
    const created = await sb("alba_customers", {
      method: "POST",
      body: {
        name: payload.name || null,
        email: payload.email || null,
        phone: payload.phone || null,
        preferred_channel: payload.preferred_channel,
        contact_consent: payload.contact_consent,
        whatsapp_consent: Boolean(payload.whatsapp_consent),
        voice_consent: Boolean(payload.voice_consent),
      },
    });
    customerId = created[0].id;
  }

  const refRows = await sb("rpc/alba_next_lead_reference", { method: "POST", body: {} }).catch(
    () => null,
  );
  // next_lead_reference is a function returning text — PostgREST rpc
  let reference;
  if (typeof refRows === "string") reference = refRows;
  else if (Array.isArray(refRows)) reference = refRows[0];
  else {
    // Fallback if RPC not exposed: use sequence via SQL not available — generate AC-timestamp
    reference = `AC-${String(Date.now()).slice(-5)}`;
  }

  const leadRows = await sb("alba_leads", {
    method: "POST",
    body: {
      submission_id: payload.submission_id,
      reference,
      customer_id: customerId,
      category: parsed.category,
      intent: payload.intent,
      original_message: payload.message || null,
      ai_summary: parsed.summary,
      ai_raw: parsed,
      vehicle_interest: parsed.vehicle
        ? `${parsed.vehicle.make || ""} ${parsed.vehicle.model || ""}`.trim()
        : payload.page_context?.vehicle_name || null,
      vehicle_id: payload.page_context?.vehicle_id || null,
      budget_aed: parsed.vehicle?.budget_aed ?? null,
      buying_timeline: parsed.buying_timeline,
      buying_intent: parsed.buying_intent,
      urgency: parsed.urgency,
      lead_score: score,
      priority,
      recommended_action: parsed.recommended_action,
      recommended_cta: parsed.recommended_cta,
      status: parsed.category === "spam" ? "spam" : "open",
      source_page: payload.page_context?.page_url || null,
      page_context: payload.page_context || {},
    },
  });
  const lead = leadRows[0];

  const confirmation =
    parsed.customer_confirmation || draftFallbackConfirmation(payload, reference);

  const channels = [];
  if (payload.preferred_channel === "email" || payload.preferred_channel === "both") {
    channels.push("email");
  }
  if (payload.preferred_channel === "whatsapp" || payload.preferred_channel === "both") {
    channels.push("whatsapp");
  }

  for (const channel of channels) {
    await sb("alba_communications", {
      method: "POST",
      body: {
        lead_id: lead.id,
        channel,
        message_type: "confirmation",
        content: confirmation,
        delivery_status: "skipped",
        error_details: "Provider not configured in local runner — body stored for review",
      },
      prefer: "return=minimal",
    });
  }

  if (priority === "hot") {
    await sb("alba_communications", {
      method: "POST",
      body: {
        lead_id: lead.id,
        channel: "sales_alert",
        message_type: "alert",
        content: parsed.sales_brief || `Hot lead ${reference}`,
        delivery_status: "skipped",
      },
      prefer: "return=minimal",
    });
  }

  if (voiceEligible) {
    await sb("alba_voice_agent_queue", {
      method: "POST",
      body: {
        lead_id: lead.id,
        customer_name: payload.name || null,
        phone: payload.phone,
        ai_summary: parsed.summary,
        suggested_opening: `Hi ${payload.name || "there"}, calling from ALBA CARS about your inquiry ${reference}.`,
        status: "ready",
      },
      prefer: "return=minimal",
    });
  }

  await sb(`alba_processing_log?submission_id=eq.${payload.submission_id}`, {
    method: "PATCH",
    body: { status: "success", updated_at: new Date().toISOString() },
    prefer: "return=minimal",
  });

  console.log(`[ok] ${scenario_key} → ${reference} (${priority}, score=${score})`);
  return { reference, lead_id: lead.id, priority, score };
}

async function main() {
  const args = process.argv.slice(2);
  const evalOnly = args.includes("--eval-only");
  const fileIdx = args.indexOf("--file");
  let files;
  if (fileIdx >= 0) {
    files = [join(root, args[fileIdx + 1])];
  } else {
    files = readdirSync(samplesDir)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => join(samplesDir, f));
  }

  for (const file of files) {
    const sample = JSON.parse(readFileSync(file, "utf8"));
    try {
      await processOne(sample, { evalOnly });
    } catch (e) {
      console.error(`[fail] ${file}:`, e.message || e);
      await sb("alba_processing_log", {
        method: "POST",
        body: {
          submission_id: sample.payload?.submission_id || sample.submission_id,
          status: "failed",
          error_stage: "local_runner",
          error_message: String(e.message || e),
        },
      }).catch(() => {});
    }
  }
}

main();
