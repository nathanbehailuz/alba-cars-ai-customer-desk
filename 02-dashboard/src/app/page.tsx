import Link from "next/link";
import { getSupabase, isConfigured, normalizeLeadRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function ConfigBanner() {
  return (
    <div className="rounded border border-hot/40 bg-hot/10 px-4 py-3 text-sm text-hot">
      Set <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
      <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> (or anon key with read
      policies) in <code className="font-mono">.env.local</code>. Apply the migration in{" "}
      <code className="font-mono">supabase/migrations</code> first.
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string | null }) {
  const tone =
    priority === "hot"
      ? "bg-hot/20 text-hot"
      : priority === "warm"
        ? "bg-amber-500/15 text-amber-200"
        : "bg-white/5 text-mute";
  return (
    <span className={`rounded px-2 py-0.5 text-xs uppercase tracking-wide ${tone}`}>
      {priority ?? "—"}
    </span>
  );
}

export default async function LeadsPage() {
  if (!isConfigured()) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <ConfigBanner />
      </div>
    );
  }

  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from("alba_leads")
    .select(
      "id, submission_id, reference, customer_id, category, intent, original_message, ai_summary, lead_score, priority, recommended_cta, status, source_page, vehicle_interest, created_at, alba_customers(name, email, phone)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const leads = (data ?? []).map((row) => normalizeLeadRow(row as Record<string, unknown>));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p className="mt-1 text-sm text-mute">Newest first · from n8n → Supabase</p>
      </div>
      {error && (
        <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error.message}
        </p>
      )}
      <div className="overflow-x-auto rounded border border-line">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wide text-mute">
            <tr>
              <th className="px-3 py-2">Ref</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">Summary</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">When</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-line hover:bg-white/[0.02]">
                <td className="px-3 py-2 font-mono text-xs">
                  <Link href={`/leads/${lead.id}`} className="text-sky-300 hover:underline">
                    {lead.reference}
                  </Link>
                </td>
                <td className="px-3 py-2 font-mono">{lead.lead_score ?? "—"}</td>
                <td className="px-3 py-2">
                  <PriorityBadge priority={lead.priority} />
                </td>
                <td className="max-w-xs truncate px-3 py-2 text-mute">
                  {lead.ai_summary || lead.original_message || lead.category || "—"}
                </td>
                <td className="px-3 py-2 text-xs text-mute">
                  {lead.customers?.email || lead.customers?.phone || "—"}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-mute">
                  {new Date(lead.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {leads.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-mute">
                  No leads yet. Submit from the web app or run a sample payload.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
