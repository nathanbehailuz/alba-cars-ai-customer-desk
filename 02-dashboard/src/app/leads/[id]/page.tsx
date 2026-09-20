import Link from "next/link";
import { notFound } from "next/navigation";
import { pickCustomerConfirmation } from "@/lib/communications";
import { departmentLabel } from "@/lib/departments";
import {
  getSupabase,
  isConfigured,
  normalizeLeadRow,
  type Communication,
  type Lead,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

async function loadPriorSubmissions(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  current: Lead,
): Promise<Lead[]> {
  const excludeId = current.id;
  const byCustomer = new Map<string, Lead>();

  if (current.customer_id) {
    const { data } = await supabase
      .from("alba_leads")
      .select(
        "id, submission_id, reference, customer_id, category, intent, original_message, ai_summary, lead_score, priority, recommended_cta, status, source_page, vehicle_interest, created_at, alba_customers(name, email, phone)",
      )
      .eq("customer_id", current.customer_id)
      .neq("id", excludeId)
      .order("created_at", { ascending: false })
      .limit(50);
    for (const row of data ?? []) {
      const lead = normalizeLeadRow(row as Record<string, unknown>);
      byCustomer.set(lead.id, lead);
    }
  }

  const email = current.customers?.email?.trim().toLowerCase();
  const phoneRaw = current.customers?.phone?.trim() || null;
  const phone = phoneRaw ? phoneRaw.replace(/\s+/g, "") : null;

  const relatedCustomerIds = new Set<string>();

  if (email) {
    const { data: byEmail } = await supabase
      .from("alba_customers")
      .select("id")
      .ilike("email", email)
      .limit(20);
    for (const c of byEmail ?? []) {
      const cid = (c as { id: string }).id;
      if (cid && cid !== current.customer_id) relatedCustomerIds.add(cid);
    }
  }

  if (phone) {
    const { data: byPhone } = await supabase
      .from("alba_customers")
      .select("id")
      .eq("phone", phone)
      .limit(20);
    for (const c of byPhone ?? []) {
      const cid = (c as { id: string }).id;
      if (cid && cid !== current.customer_id) relatedCustomerIds.add(cid);
    }
    if (phoneRaw && phoneRaw !== phone) {
      const { data: byPhoneRaw } = await supabase
        .from("alba_customers")
        .select("id")
        .eq("phone", phoneRaw)
        .limit(20);
      for (const c of byPhoneRaw ?? []) {
        const cid = (c as { id: string }).id;
        if (cid && cid !== current.customer_id) relatedCustomerIds.add(cid);
      }
    }
  }

  const ids = [...relatedCustomerIds];
  if (ids.length) {
    const { data } = await supabase
      .from("alba_leads")
      .select(
        "id, submission_id, reference, customer_id, category, intent, original_message, ai_summary, lead_score, priority, recommended_cta, status, source_page, vehicle_interest, created_at, alba_customers(name, email, phone)",
      )
      .in("customer_id", ids)
      .neq("id", excludeId)
      .order("created_at", { ascending: false })
      .limit(50);
    for (const row of data ?? []) {
      const lead = normalizeLeadRow(row as Record<string, unknown>);
      byCustomer.set(lead.id, lead);
    }
  }

  return [...byCustomer.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isConfigured()) {
    return <p className="text-mute">Configure Supabase env first.</p>;
  }

  const supabase = getSupabase()!;
  const { data: lead } = await supabase
    .from("alba_leads")
    .select("*, alba_customers(name, email, phone, preferred_channel)")
    .eq("id", id)
    .maybeSingle();

  if (!lead) notFound();

  const normalized = normalizeLeadRow(lead as Record<string, unknown>);
  const typed = {
    ...normalized,
    ...(lead as Record<string, unknown>),
    customers: normalized.customers as {
      name: string | null;
      email: string | null;
      phone: string | null;
      preferred_channel: string | null;
    } | null,
  } as Lead & {
    customers: {
      name: string | null;
      email: string | null;
      phone: string | null;
      preferred_channel: string | null;
    } | null;
    recommended_action?: string | null;
    budget_aed?: number | null;
    buying_timeline?: string | null;
  };

  const { data: messages } = await supabase
    .from("alba_communications")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  const { data: voice } = await supabase
    .from("alba_voice_agent_queue")
    .select("*")
    .eq("lead_id", id)
    .maybeSingle();

  const confirmation = pickCustomerConfirmation((messages ?? []) as Communication[]);
  const prior = await loadPriorSubmissions(supabase, typed);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-mute hover:text-white">
        ← Submissions
      </Link>
      <div>
        <h1 className="font-mono text-2xl">{typed.reference}</h1>
        <p className="mt-1 text-sm text-mute">
          {departmentLabel(typed.category)} · intent {typed.intent || "—"} · score{" "}
          {typed.lead_score ?? "—"} · {typed.priority ?? "—"} · {formatWhen(typed.created_at)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded border border-line bg-panel p-4">
          <h2 className="text-sm font-medium">Department</h2>
          <p className="mt-2 text-sm">{departmentLabel(typed.category)}</p>
          <p className="mt-1 font-mono text-xs text-mute">{typed.category || "—"}</p>
        </section>
        <section className="rounded border border-line bg-panel p-4">
          <h2 className="text-sm font-medium">Customer</h2>
          <p className="mt-2 text-sm">{typed.customers?.name || "—"}</p>
          <p className="text-sm text-mute">{typed.customers?.email}</p>
          <p className="text-sm text-mute">{typed.customers?.phone}</p>
          <p className="mt-2 text-xs text-mute">
            Channel: {typed.customers?.preferred_channel || "—"}
          </p>
        </section>
      </div>

      <section className="rounded border border-line bg-panel p-4">
        <h2 className="text-sm font-medium">AI summary</h2>
        <p className="mt-2 text-sm text-mute">{typed.ai_summary || "—"}</p>
        <p className="mt-3 text-xs text-mute">CTA: {typed.recommended_cta || "—"}</p>
      </section>

      <section className="rounded border border-sky-500/30 bg-sky-500/5 p-4">
        <h2 className="text-sm font-medium">Message sent to customer</h2>
        {confirmation ? (
          <>
            <p className="mt-1 font-mono text-xs text-mute">
              {confirmation.channel} · {confirmation.message_type}
              {"delivery_status" in confirmation && confirmation.delivery_status
                ? ` · ${confirmation.delivery_status}`
                : ""}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-mute">{confirmation.content}</p>
          </>
        ) : (
          <p className="mt-2 text-sm text-mute">No confirmation message stored yet.</p>
        )}
      </section>

      <section className="rounded border border-line bg-panel p-4">
        <h2 className="text-sm font-medium">Original form message</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-mute">
          {typed.original_message || "—"}
        </p>
      </section>

      {voice && (
        <section className="rounded border border-line bg-panel p-4">
          <h2 className="text-sm font-medium">Voice agent queue</h2>
          <p className="mt-2 font-mono text-sm">{(voice as { status: string }).status}</p>
          <p className="mt-1 text-sm text-mute">
            {(voice as { suggested_opening?: string }).suggested_opening}
          </p>
        </section>
      )}

      <section className="rounded border border-line bg-panel p-4">
        <h2 className="text-sm font-medium">All communications</h2>
        <ul className="mt-3 space-y-3">
          {((messages ?? []) as Communication[]).map((m) => (
            <li key={m.id} className="border-t border-line pt-3 text-sm">
              <p className="font-mono text-xs text-mute">
                {m.channel} · {m.message_type} · {m.delivery_status}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-mute">{m.content}</p>
            </li>
          ))}
          {(messages ?? []).length === 0 && (
            <li className="text-sm text-mute">No communications yet.</li>
          )}
        </ul>
      </section>

      <section className="rounded border border-line bg-panel p-4">
        <h2 className="text-sm font-medium">Previous submissions by this person</h2>
        <p className="mt-1 text-xs text-mute">
          Matched by customer record, then email / phone
        </p>
        {prior.length === 0 ? (
          <p className="mt-3 text-sm text-mute">No earlier form fills found.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {prior.map((p) => (
              <li key={p.id} className="py-3">
                <Link href={`/leads/${p.id}`} className="block hover:bg-white/[0.02]">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-mono text-sm text-sky-300">{p.reference}</span>
                    <span className="font-mono text-xs text-mute">{formatWhen(p.created_at)}</span>
                  </div>
                  <p className="mt-1 text-xs text-mute">
                    {departmentLabel(p.category)} · {p.ai_summary || p.original_message || "—"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
