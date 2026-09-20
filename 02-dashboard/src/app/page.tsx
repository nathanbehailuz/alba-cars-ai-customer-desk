import Link from "next/link";
import { pickCustomerConfirmation, truncate } from "@/lib/communications";
import { dateFilterGte, parseDateFilter, type DateFilter } from "@/lib/date-range";
import { DEPARTMENT_OPTIONS, departmentLabel } from "@/lib/departments";
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

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; department?: string }>;
}) {
  const sp = await searchParams;
  const dateFilter: DateFilter = parseDateFilter(sp.date);
  const department = sp.department?.trim() || "";

  if (!isConfigured()) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <ConfigBanner />
      </div>
    );
  }

  const supabase = getSupabase()!;
  let query = supabase
    .from("alba_leads")
    .select(
      "id, submission_id, reference, customer_id, category, intent, original_message, ai_summary, lead_score, priority, recommended_cta, status, source_page, vehicle_interest, created_at, alba_customers(name, email, phone), alba_communications(content, message_type, channel, delivery_status, created_at)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const gte = dateFilterGte(dateFilter);
  if (gte) query = query.gte("created_at", gte);
  if (department) query = query.eq("category", department);

  const { data, error } = await query;
  const leads = (data ?? []).map((row) => normalizeLeadRow(row as Record<string, unknown>));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <p className="mt-1 text-sm text-mute">
          Form fills · department routing · AI summary · confirmation message
        </p>
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-3 rounded border border-line bg-panel px-4 py-3"
      >
        <label className="flex flex-col gap-1 text-xs text-mute">
          Date
          <select
            name="date"
            defaultValue={dateFilter}
            className="rounded border border-line bg-ink px-2 py-1.5 text-sm text-white"
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-mute">
          Department
          <select
            name="department"
            defaultValue={department}
            className="rounded border border-line bg-ink px-2 py-1.5 text-sm text-white"
          >
            <option value="">All</option>
            {DEPARTMENT_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/15"
        >
          Apply
        </button>
      </form>

      {error && (
        <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error.message}
        </p>
      )}

      <div className="overflow-x-auto rounded border border-line">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="bg-panel text-xs uppercase tracking-wide text-mute">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Ref</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2">AI summary</th>
              <th className="px-3 py-2">Message to customer</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const confirmation = pickCustomerConfirmation(lead.communications);
              const contactName = lead.customers?.name;
              const contactLine =
                lead.customers?.email || lead.customers?.phone || "—";
              return (
                <tr key={lead.id} className="border-t border-line hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-mute">
                    <Link href={`/leads/${lead.id}`} className="block hover:text-white">
                      {formatWhen(lead.created_at)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    <Link href={`/leads/${lead.id}`} className="text-sky-300 hover:underline">
                      {lead.reference}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <Link href={`/leads/${lead.id}`} className="block hover:text-white">
                      {contactName && <span className="block text-white/90">{contactName}</span>}
                      <span className="text-mute">{contactLine}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <Link href={`/leads/${lead.id}`} className="block hover:text-white">
                      {departmentLabel(lead.category)}
                    </Link>
                  </td>
                  <td className="max-w-[14rem] px-3 py-2 text-xs text-mute">
                    <Link href={`/leads/${lead.id}`} className="block hover:text-white">
                      {truncate(lead.ai_summary || lead.original_message, 100)}
                    </Link>
                  </td>
                  <td className="max-w-[16rem] px-3 py-2 text-xs text-mute">
                    <Link href={`/leads/${lead.id}`} className="block hover:text-white">
                      {truncate(confirmation?.content, 110)}
                    </Link>
                  </td>
                </tr>
              );
            })}
            {leads.length === 0 && !error && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-mute">
                  No submissions match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
