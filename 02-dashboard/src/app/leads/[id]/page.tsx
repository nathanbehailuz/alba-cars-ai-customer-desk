import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase, isConfigured, type Communication, type Lead } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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
    .from("leads")
    .select(
      "*, customers(name, email, phone, preferred_channel)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!lead) notFound();

  const typed = lead as Lead & {
    ai_raw?: unknown;
    page_context?: unknown;
    customers?: {
      name: string | null;
      email: string | null;
      phone: string | null;
      preferred_channel: string | null;
    } | null;
  };

  const { data: messages } = await supabase
    .from("communications")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  const { data: voice } = await supabase
    .from("voice_agent_queue")
    .select("*")
    .eq("lead_id", id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-mute hover:text-white">
        ← Leads
      </Link>
      <div>
        <h1 className="font-mono text-2xl">{typed.reference}</h1>
        <p className="mt-1 text-sm text-mute">
          {typed.category} · score {typed.lead_score ?? "—"} · {typed.priority ?? "—"}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded border border-line bg-panel p-4">
          <h2 className="text-sm font-medium">AI summary</h2>
          <p className="mt-2 text-sm text-mute">{typed.ai_summary || "—"}</p>
          <p className="mt-3 text-xs text-mute">CTA: {typed.recommended_cta || "—"}</p>
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
        <h2 className="text-sm font-medium">Original message</h2>
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
        <h2 className="text-sm font-medium">Messages</h2>
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
    </div>
  );
}
