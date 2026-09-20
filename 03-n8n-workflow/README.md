# 03 — n8n workflow

Lead acquisition pipeline for ALBA CARS: webhook → validate → OpenAI → Supabase → confirmations / sales alert / voice queue.

Satisfies [docs/task.md](../docs/task.md): trigger, external API, transform, branching, error handling, verifiable output, plus LLM + idempotency bonuses.

## Contents

| Path | Purpose |
| --- | --- |
| [`alba-inquiry-workflow.json`](./alba-inquiry-workflow.json) | Import into n8n Cloud / self-host |
| [`sample-payloads/`](./sample-payloads/) | Canned inquiries for AI evaluation |
| [`scripts/run-samples.mjs`](./scripts/run-samples.mjs) | Local runner mirroring the pipeline (OpenAI + Supabase) when n8n is not yet live |

## What and why

Website visitors submit the inquiry desk instead of WhatsApp. This workflow turns each submission into a scored CRM lead, stores the drafted confirmation as a message row, alerts sales on hot leads, and marks voice-agent-ready rows when phone + consent exist.

## Credentials / env (placeholders — never commit secrets)

Set in n8n environment (or credentials):

| Variable | Used for |
| --- | --- |
| `OPENAI_API_KEY` | Classification + confirmation draft |
| `OPENAI_MODEL` | Optional (default `gpt-4o-mini`) |
| `SUPABASE_URL` | Project URL (`https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | REST writes (bypasses RLS) |
| `EMAIL_PROVIDER` / `WHATSAPP_PROVIDER` / `SALES_ALERT_PROVIDER` | Optional; if unset, communications store as `skipped` with body |

Apply SQL in [`../supabase/migrations`](../supabase/migrations) before running.

## How to run (n8n)

See **[ACTIVATE.md](./ACTIVATE.md)** for import → env → Active toggle → Production URL.

1. Import `alba-inquiry-workflow.json`.
2. Set env vars; activate the workflow.
3. Copy the webhook URL (path `alba-inquiry`) into `01-web-app` `.env.local` as `N8N_WEBHOOK_URL` or `NEXT_PUBLIC_N8N_WEBHOOK_URL`.
4. Submit from the widget, or POST a file from `sample-payloads/`.

In-repo fallback (same logic without Cloud): set `INQUIRY_PIPELINE=local` and Supabase/OpenAI env on `01-web-app` — see `01-web-app/src/lib/pipeline.ts`.

### Manual sample POST

```bash
curl -sS -X POST "$N8N_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d @sample-payloads/01-high-intent-rav4.json
```

Note: sample files wrap the body as `{ "name", "payload" }`. For the webhook, POST **`payload` only** (or unwrap in a Set node). The local runner accepts the wrapped format.

```bash
jq .payload sample-payloads/01-high-intent-rav4.json | curl -sS -X POST "$N8N_WEBHOOK_URL" -H 'Content-Type: application/json' -d @-
```

## Local AI sample runner (verify GPT behaviour)

```bash
# from repo root, with .env loaded
export $(grep -v '^#' .env | xargs)   # or use your preferred dotenv tool
node 03-n8n-workflow/scripts/run-samples.mjs
# or one file:
node 03-n8n-workflow/scripts/run-samples.mjs --file sample-payloads/01-high-intent-rav4.json
# classify + store ai_eval_runs only:
node 03-n8n-workflow/scripts/run-samples.mjs --eval-only
```

Then open `02-dashboard` → **AI samples** / **Leads**.

## Node-by-node (logical)

1. **Webhook** — receives inquiry JSON from `01-web-app` `/api/inquiry`.
2. **Validate** — email/phone, consent, channel rules; reject with 400 if invalid.
3. **Processing log** — insert `processing`.
4. **Idempotency lookup** — `leads` by `submission_id`; if exists, respond with existing `reference`.
5. **OpenAI** — structured JSON classify / score / draft confirmation.
6. **Normalize** — clamp score, priority bands, voice gate (phone + `voice_consent`).
7. **Customer upsert** — find by email or phone; patch or insert.
8. **Reference** — `rpc/next_lead_reference` → `AC-#####` (fallback generated).
9. **Lead insert** — full AI fields + page context.
10. **Communications** — email / WhatsApp confirmation rows (`skipped` without provider).
11. **Switch priority** — `hot` → sales_alert communication.
12. **Voice IF** — insert `voice_agent_queue` `ready` when eligible.
13. **Success log** — update `processing_log`.
14. **Respond** — `{ ok, reference, lead_id, summary }`.
15. **Error path** — failed HTTP / AI → `processing_log` failed + 500 response (`continueOnFail` on flaky HTTP).

## How to verify

| Check | Where |
| --- | --- |
| Lead + reference | Supabase `leads` or dashboard `/` |
| Message body | `communications` or dashboard `/messages` |
| AI sample outputs | `ai_eval_runs` or dashboard `/eval` |
| Hot alert | `communications` channel `sales_alert` |
| Voice ready | `voice_agent_queue.status = ready` |
| Idempotency | Re-POST same `submission_id` → same reference, no second lead |
| Screenshot | Capture n8n execution + dashboard row for README / BUILD_LOG |

## Assignment checklist map

| task.md requirement | Covered by |
| --- | --- |
| Trigger | Webhook |
| External data | OpenAI + Supabase HTTP |
| Transformation | Code / Set nodes |
| Conditional logic | IF duplicate, Switch priority, IF voice / channels |
| Error handling | continueOnFail + failed log branch |
| Verifiable output | Supabase rows + webhook JSON + dashboard |
| LLM bonus | OpenAI classify/draft |
| Idempotency bonus | `submission_id` unique |
