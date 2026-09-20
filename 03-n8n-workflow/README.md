# 03 — n8n workflow

Lead acquisition pipeline for ALBA CARS: webhook → validate → OpenAI → Supabase (`alba_*`) → confirmations / sales alert / voice queue.

Satisfies [docs/task.md](../docs/task.md): trigger, external API, transform, branching, error handling, verifiable output, plus LLM + idempotency bonuses.

## Contents

| Path | Purpose |
| --- | --- |
| [`alba-inquiry-workflow.json`](./alba-inquiry-workflow.json) | Import into n8n Cloud / self-host |
| [`ACTIVATE.md`](./ACTIVATE.md) | Import → Variables → Active → Production URL |
| [`sample-payloads/`](./sample-payloads/) | Canned inquiries for AI evaluation |
| [`scripts/run-samples.mjs`](./scripts/run-samples.mjs) | Local runner mirroring the pipeline (OpenAI + Supabase) |
| [`docs/success-sample.json`](./docs/success-sample.json) | Captured successful webhook response |

## What and why

Website visitors submit the inquiry desk instead of WhatsApp. This workflow turns each submission into a scored CRM lead, stores the drafted confirmation as a message row, alerts sales on hot leads, and marks voice-agent-ready rows when phone + consent exist.

## Credentials / env (placeholders — never commit secrets)

n8n **Cloud** blocks `$env`. Create **Personal → Variables** (`$vars`):

| Variable | Used for |
| --- | --- |
| `OPENAI_API_KEY` | Classification + confirmation draft |
| `OPENAI_MODEL` | `gpt-5-nano` (cheapest) |
| `SUPABASE_URL` | Project URL (`https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | REST writes (bypasses RLS) |
| `EMAIL_PROVIDER` / `WHATSAPP_PROVIDER` / `SALES_ALERT_PROVIDER` | Optional; if unset, communications store as `skipped` with body |

Tables (applied on grid150): `alba_customers`, `alba_leads`, `alba_communications`, `alba_processing_log`, `alba_voice_agent_queue`, `alba_ai_eval_runs`.

Apply SQL in [`../supabase/migrations`](../supabase/migrations) before running on a new project.

## How to run (n8n)

See **[ACTIVATE.md](./ACTIVATE.md)** for import → Variables → Active toggle → Production URL.

1. Import `alba-inquiry-workflow.json` (re-import after pulling fixes from `main`).
2. Set Variables; activate / publish the workflow.
3. Copy the Production webhook URL (path `alba-inquiry`) into `01-web-app` as `N8N_WEBHOOK_URL`.
4. Submit from the widget, or POST a file from `sample-payloads/`.

Live instance: [albacarsdemo.app.n8n.cloud](https://albacarsdemo.app.n8n.cloud).

In-repo fallback (same logic without Cloud): set `INQUIRY_PIPELINE=local` and Supabase/OpenAI env on `01-web-app` — see `01-web-app/src/lib/pipeline.ts`.

### Manual sample POST

```bash
curl -sS -X POST "$N8N_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d @sample-payloads/01-high-intent-rav4.json
```

Note: sample files wrap the body as `{ "name", "payload" }`. For the webhook, POST **`payload` only**:

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

1. **Inquiry Webhook** — receives inquiry JSON (`responseMode: responseNode`).
2. **Validate Input** — email/phone, consent, channel rules; reject with 400 if invalid.
3. **Log Processing Start** — insert `alba_processing_log` (`processing`); `alwaysOutputData` on empty lists.
4. **Check Duplicate Lead** — `alba_leads` by `submission_id`; if exists, respond with existing `reference`.
5. **Find Customer** → **Customer Lookup Result** → **IF Customer Exists** → **Update** or **Create Customer** (plain POST + `Prefer: return=representation`).
6. **Resolve Customer Id** — reads `$input` / executed branch only (`.isExecuted`).
7. **OpenAI Classify** — structured JSON classify / score / draft (no `temperature` for gpt-5-nano).
8. **Normalize** — clamp score, priority bands, voice gate (phone + `voice_consent`).
9. **Get Lead Reference RPC** → **Attach Lead Id** — `rpc/next_lead_reference` → `AC-#####` (fallback generated).
10. **Insert Lead** — full AI fields + page context into `alba_leads`.
11. **Respond Success** — webhook JSON `{ ok, reference, submission_id, lead_id, summary }` (then async side effects continue).
12. **Switch Priority** — `hot` → sales_alert communication.
13. **Communications** — email / WhatsApp confirmation rows (`skipped` without provider).
14. **Voice IF** — insert `alba_voice_agent_queue` `ready` when eligible.
15. **Log Processing Success** — update `alba_processing_log`.
16. **Error path** — failed HTTP / AI → failed log + error Respond (`continueOnFail` on flaky HTTP).

## How to verify

| Check | Where |
| --- | --- |
| Lead + reference | Supabase `alba_leads` or dashboard `/` |
| Message body | `alba_communications` or dashboard `/messages` |
| AI sample outputs | `alba_ai_eval_runs` or dashboard `/eval` |
| Hot alert | `alba_communications` channel `sales_alert` |
| Voice ready | `alba_voice_agent_queue.status = ready` |
| Idempotency | Re-POST same `submission_id` → same reference, no second lead |

### Success sample (captured run)

Webhook response for reference **AC-42904** (also see [docs/success-sample.json](./docs/success-sample.json)):

```json
{
  "ok": true,
  "reference": "AC-42904",
  "submission_id": "c6f39be6-3245-43b4-ae2e-41011513ed51",
  "lead_id": "1b2395b3-d256-4456-93e3-46c7b67089ca",
  "summary": "Buyer seeks Toyota RAV4 under 130,000 AED; intends to purchase; channel is email; no voice consent."
}
```

Production web smoke also returned **AC-85949** via `https://alba-cars-web.vercel.app/api/inquiry`.

Optional: see [docs/success-execution.png](./docs/success-execution.png) for an n8n Cloud **Executions** screenshot (success rows for this workflow).

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
