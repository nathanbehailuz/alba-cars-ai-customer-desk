import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Lead = {
  id: string;
  submission_id: string;
  reference: string;
  customer_id: string;
  category: string | null;
  intent: string | null;
  original_message: string | null;
  ai_summary: string | null;
  lead_score: number | null;
  priority: string | null;
  recommended_cta: string | null;
  status: string;
  source_page: string | null;
  vehicle_interest: string | null;
  created_at: string;
  customers?: { name: string | null; email: string | null; phone: string | null } | null;
};

/** PostgREST embed typing may use arrays; alba_leads.customer_id is many-to-one. */
export function normalizeLeadRow(row: Record<string, unknown>): Lead {
  const raw = row.alba_customers ?? row.customers;
  let customers: Lead["customers"] = null;
  if (raw != null) {
    customers = (Array.isArray(raw) ? raw[0] : raw) as Lead["customers"];
  }
  const { alba_customers: _embed, ...rest } = row;
  return { ...rest, customers } as Lead;
}

export type Communication = {
  id: string;
  lead_id: string;
  channel: string;
  message_type: string;
  content: string;
  delivery_status: string;
  sent_at: string | null;
  created_at: string;
};

export type AiEvalRun = {
  id: string;
  scenario_key: string;
  input_payload: Record<string, unknown>;
  model: string | null;
  output_json: Record<string, unknown> | null;
  latency_ms: number | null;
  notes: string | null;
  created_at: string;
};

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}
