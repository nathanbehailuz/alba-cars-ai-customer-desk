import { getSupabase, isConfigured, type AiEvalRun } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function EvalPage() {
  if (!isConfigured()) {
    return (
      <p className="text-sm text-mute">
        Configure Supabase env to inspect AI sample runs (`ai_eval_runs`).
      </p>
    );
  }

  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from("ai_eval_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (data ?? []) as AiEvalRun[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI samples</h1>
        <p className="mt-1 text-sm text-mute">
          Outputs from the canned inquiry pack (n8n eval path → <code>ai_eval_runs</code>)
        </p>
      </div>
      {error && <p className="text-sm text-red-300">{error.message}</p>}
      <div className="space-y-4">
        {rows.map((run) => {
          const out = run.output_json ?? {};
          return (
            <article key={run.id} className="rounded border border-line bg-panel p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-mono text-sm">{run.scenario_key}</h2>
                <p className="font-mono text-xs text-mute">
                  {run.model ?? "—"} · {run.latency_ms ?? "—"}ms ·{" "}
                  {new Date(run.created_at).toLocaleString()}
                </p>
              </div>
              <dl className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                <div>
                  <dt className="text-xs text-mute">Category</dt>
                  <dd>{String(out.category ?? "—")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mute">Score</dt>
                  <dd className="font-mono">{String(out.lead_score ?? "—")}</dd>
                </div>
                <div>
                  <dt className="text-xs text-mute">CTA</dt>
                  <dd>{String(out.recommended_cta ?? "—")}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-mute">{String(out.summary ?? "")}</p>
              {out.customer_confirmation != null && (
                <pre className="mt-3 overflow-x-auto rounded bg-ink p-3 font-mono text-xs text-mute">
                  {String(out.customer_confirmation)}
                </pre>
              )}
            </article>
          );
        })}
        {rows.length === 0 && !error && (
          <p className="text-sm text-mute">
            No eval runs yet. Import sample payloads from{" "}
            <code className="font-mono">03-n8n-workflow/sample-payloads</code>.
          </p>
        )}
      </div>
    </div>
  );
}
