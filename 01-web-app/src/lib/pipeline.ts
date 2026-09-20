export type InquiryPayload = {
  submission_id: string;
  intent?: string;
  category_seed?: string;
  name?: string;
  email?: string;
  phone?: string;
  preferred_channel?: "email" | "whatsapp" | "both";
  message?: string;
  contact_consent?: boolean;
  whatsapp_consent?: boolean;
  voice_consent?: boolean;
  page_context?: Record<string, unknown>;
};

export type PipelineResult = {
  ok: true;
  mode: "local";
  reference: string;
  lead_id: string;
  summary?: string;
  priority?: string;
  score?: number;
};

function env(name: string) {
  return process.env[name]?.trim() || "";
}

export function localPipelineConfigured() {
  const url = env("NEXT_PUBLIC_SUPABASE_URL") || env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const openai = env("OPENAI_API_KEY");
  return Boolean(url && key && key.startsWith("eyJ") && openai.startsWith("sk-"));
}

async function sb(
  supabaseUrl: string,
  serviceKey: string,
  path: string,
  opts: { method?: string; body?: unknown; prefer?: string } = {},
) {
  const method = opts.method || "GET";
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer || (method === "POST" ? "return=representation" : "return=minimal"),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${method} ${path}: ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

function priorityFromScore(score: number) {
  if (score >= 80) return "hot";
  if (score >= 50) return "warm";
  return "early";
}

function interestPhrase(payload: InquiryPayload) {
  const intent = String(payload.intent || payload.category_seed || "").toLowerCase();
  const map: Record<string, string> = {
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

function draftFallbackConfirmation(
  payload: InquiryPayload,
  reference: string,
  appointmentUrl: string,
) {
  const name = (payload.name || "").trim().split(/\s+/)[0];
  const hello = name ? `Hi ${name},` : "Hi,";
  const detail = (payload.message || "").trim();
  const detailBit = detail
    ? ` Details we captured: "${detail.slice(0, 140)}${detail.length > 140 ? "…" : ""}".`
    : "";
  return `${hello} thanks for reaching out to ALBA CARS! We have noted your interest to ${interestPhrase(payload)}.${detailBit} Next step: a sales advisor will review your request and follow up shortly. You can also book here: ${appointmentUrl}. Your reference is ${reference}.`;
}

function validate(payload: InquiryPayload) {
  if (!payload?.submission_id) return "submission_id required";
  if (!payload.email && !payload.phone) return "email or phone required";
  if (!payload.contact_consent) return "contact_consent required";
  const ch = payload.preferred_channel;
  if ((ch === "whatsapp" || ch === "both") && !payload.phone) return "phone required for WhatsApp";
  if ((ch === "email" || ch === "both") && !payload.email) return "email required for email channel";
  return null;
}

/** Full inquiry automation (mirrors n8n): validate → OpenAI → alba_* Supabase → confirmations. */
export async function runLocalInquiryPipeline(
  payload: InquiryPayload,
): Promise<PipelineResult> {
  const problem = validate(payload);
  if (problem) throw new Error(problem);

  const supabaseUrl = env("NEXT_PUBLIC_SUPABASE_URL") || env("SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  const openaiKey = env("OPENAI_API_KEY");
  const model = env("OPENAI_MODEL") || "gpt-5-nano";
  const appointmentUrl = env("APPOINTMENT_URL") || "https://example.com/book";

  if (!supabaseUrl || !serviceKey || !openaiKey) {
    throw new Error("Local pipeline missing OpenAI or Supabase service role env");
  }

  await sb(supabaseUrl, serviceKey, "alba_processing_log", {
    method: "POST",
    body: {
      submission_id: payload.submission_id,
      workflow_run_id: `local-api-${Date.now()}`,
      status: "processing",
    },
  });

  const existing = await sb(
    supabaseUrl,
    serviceKey,
    `alba_leads?submission_id=eq.${payload.submission_id}&select=id,reference,ai_summary`,
  );
  if (Array.isArray(existing) && existing.length) {
    return {
      ok: true,
      mode: "local",
      reference: existing[0].reference,
      lead_id: existing[0].id,
      summary: existing[0].ai_summary,
    };
  }

  const system = `You are ALBA CARS lead qualification AI. Return ONLY valid JSON with keys:
category, summary, vehicle (object), buying_timeline, buying_intent, urgency,
lead_score (0-100), recommended_action, recommended_cta, voice_agent_eligible (boolean),
customer_confirmation, sales_brief.
Categories: vehicle_purchase, vehicle_search, test_drive, financing, trade_in, vehicle_sale, general_sales_question, spam.
Currency AED. Brand voice: professional Dubai dealership.

customer_confirmation must be a short natural email/WhatsApp message in plain prose only — never numbered lists like 1) 2), never markdown bullets. In flowing sentences: thank them for reaching out to ALBA CARS (use first name if provided); say we have noted their interest in plain language (buy a car, trade-in, sell, test drive, financing, find a car, or a general question) with 1–2 concrete details from their message; end with one clear next step (advisor follow-up, appointment link ${appointmentUrl}, expect a call). Under ~120 words. Mention the inquiry reference (AC-#####) once if present.`;

  const started = Date.now();
  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      max_completion_tokens: 800,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });
  const aiJson = await aiRes.json();
  if (!aiRes.ok) throw new Error(`OpenAI failed: ${JSON.stringify(aiJson)}`);
  const raw = aiJson.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const latencyMs = Date.now() - started;

  const voiceEligible =
    Boolean(parsed.voice_agent_eligible) &&
    Boolean(payload.phone) &&
    Boolean(payload.voice_consent);
  const score = Number(parsed.lead_score) || 0;
  const priority = priorityFromScore(score);

  await sb(supabaseUrl, serviceKey, "alba_ai_eval_runs", {
    method: "POST",
    body: {
      scenario_key: `widget-${payload.intent || "inquiry"}`,
      input_payload: payload,
      model,
      output_json: { ...parsed, voice_agent_eligible: voiceEligible },
      latency_ms: latencyMs,
      notes: "local api pipeline",
    },
    prefer: "return=minimal",
  });

  const filter = payload.email
    ? `email=eq.${encodeURIComponent(payload.email)}`
    : `phone=eq.${encodeURIComponent(payload.phone!)}`;
  const found = await sb(supabaseUrl, serviceKey, `alba_customers?${filter}&select=id`);
  let customerId: string;
  if (Array.isArray(found) && found.length) {
    customerId = found[0].id;
    await sb(supabaseUrl, serviceKey, `alba_customers?id=eq.${customerId}`, {
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
    const created = await sb(supabaseUrl, serviceKey, "alba_customers", {
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

  let reference: string;
  try {
    const refRows = await sb(supabaseUrl, serviceKey, "rpc/alba_next_lead_reference", {
      method: "POST",
      body: {},
    });
    reference =
      typeof refRows === "string"
        ? refRows
        : Array.isArray(refRows)
          ? String(refRows[0])
          : `AC-${String(Date.now()).slice(-5)}`;
  } catch {
    reference = `AC-${String(Date.now()).slice(-5)}`;
  }

  const vehicle = (parsed.vehicle || {}) as Record<string, unknown>;
  const leadRows = await sb(supabaseUrl, serviceKey, "alba_leads", {
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
      vehicle_interest:
        `${vehicle.make || ""} ${vehicle.model || ""}`.trim() ||
        (payload.page_context?.vehicle_name as string) ||
        null,
      vehicle_id: (payload.page_context?.vehicle_id as string) || null,
      budget_aed: vehicle.budget_aed ?? null,
      buying_timeline: parsed.buying_timeline,
      buying_intent: parsed.buying_intent,
      urgency: parsed.urgency,
      lead_score: score,
      priority,
      recommended_action: parsed.recommended_action,
      recommended_cta: parsed.recommended_cta,
      status: parsed.category === "spam" ? "spam" : "open",
      source_page: (payload.page_context?.page_url as string) || null,
      page_context: payload.page_context || {},
    },
  });
  const lead = leadRows[0];

  const confirmation =
    (parsed.customer_confirmation as string) ||
    draftFallbackConfirmation(payload, reference, appointmentUrl);

  const channels: Array<"email" | "whatsapp"> = [];
  if (payload.preferred_channel === "email" || payload.preferred_channel === "both") {
    channels.push("email");
  }
  if (payload.preferred_channel === "whatsapp" || payload.preferred_channel === "both") {
    channels.push("whatsapp");
  }

  for (const channel of channels) {
    await sb(supabaseUrl, serviceKey, "alba_communications", {
      method: "POST",
      body: {
        lead_id: lead.id,
        channel,
        message_type: "confirmation",
        content: confirmation,
        delivery_status: "skipped",
        error_details: "Provider not configured — body stored for review",
      },
      prefer: "return=minimal",
    });
  }

  if (priority === "hot") {
    await sb(supabaseUrl, serviceKey, "alba_communications", {
      method: "POST",
      body: {
        lead_id: lead.id,
        channel: "sales_alert",
        message_type: "alert",
        content: (parsed.sales_brief as string) || `Hot lead ${reference}`,
        delivery_status: "skipped",
      },
      prefer: "return=minimal",
    });
  }

  if (voiceEligible && payload.phone) {
    await sb(supabaseUrl, serviceKey, "alba_voice_agent_queue", {
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

  await sb(
    supabaseUrl,
    serviceKey,
    `alba_processing_log?submission_id=eq.${payload.submission_id}`,
    {
      method: "PATCH",
      body: { status: "success", updated_at: new Date().toISOString() },
      prefer: "return=minimal",
    },
  );

  return {
    ok: true,
    mode: "local",
    reference,
    lead_id: lead.id,
    summary: parsed.summary as string | undefined,
    priority,
    score,
  };
}
