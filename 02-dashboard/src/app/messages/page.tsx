import { getSupabase, isConfigured, type Communication } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  if (!isConfigured()) {
    return (
      <p className="text-sm text-mute">
        Configure Supabase env to load communications.
      </p>
    );
  }

  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from("alba_communications")
    .select("id, lead_id, channel, message_type, content, delivery_status, sent_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (data ?? []) as Communication[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="mt-1 text-sm text-mute">Outbound confirmations &amp; sales alerts</p>
      </div>
      {error && <p className="text-sm text-red-300">{error.message}</p>}
      <ul className="space-y-3">
        {rows.map((m) => (
          <li key={m.id} className="rounded border border-line bg-panel p-4">
            <p className="font-mono text-xs text-mute">
              {m.channel} · {m.message_type} · {m.delivery_status} · lead {m.lead_id.slice(0, 8)}…
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm">{m.content}</p>
          </li>
        ))}
        {rows.length === 0 && !error && (
          <li className="text-sm text-mute">No messages stored yet.</li>
        )}
      </ul>
    </div>
  );
}
