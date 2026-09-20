# Build Log: ALBA CARS AI Customer Desk

## Goal & scope decision

Built a monorepo per [docs/task.md](docs/task.md): marketing-site mimic + inquiry desk (`01-web-app`), Supabase-backed dashboard (`02-dashboard`), and n8n workflow package (`03-n8n-workflow`). Persistence is **Supabase** (not Google Sheets). WhatsApp bubble replaced by an on-site inquiry widget. Live inventory, real voice dialer, and production WhatsApp/email providers are deferred (bodies stored as `skipped`).

## Stack & tooling

| Piece | Choice | Why |
| --- | --- | --- |
| Web + dashboard | Next.js 15 App Router, TS, Tailwind | Fast multi-page UI + API route proxy to n8n |
| DB | Supabase Postgres + RLS (`alba_*` on **grid150**) | Assignment-friendly verifiable CRM; service role for n8n / dashboard reads |
| Automation | n8n Cloud webhook + local `run-samples.mjs` | Meets task.md; local runner for GPT eval offline |
| AI | OpenAI `gpt-5-nano` JSON mode | Classify, score, draft confirmation |
| Hosting | Vercel (two projects) | Live review URLs for web + dashboard |

## Key decisions & trade-offs

- **Multi-page mimic (Home/Buy/Sell/Finance)** instead of widget-only — matches PRD lock and reviewer recognition of [albacars.ae](https://albacars.ae/).
- **Prefixed tables on shared grid150** — free-tier project limit blocked a dedicated Supabase project; schema applied as `alba_*` so it stays separate from other data.
- **n8n Cloud Variables (`$vars`)** — Cloud denies `$env`; workflow uses Personal Variables.
- **Communications `skipped`** without email/WhatsApp providers — still verifiable message content in Supabase/dashboard.
- **Local sample runner** mirrors n8n — fills `alba_ai_eval_runs` when needed.
- **Sales notification** for MVP: `sales_alert` row in `alba_communications` (delivery `skipped` without provider).

## Hard parts / dead ends

- `create-next-app` refused the workspace path (false “not writable”); scaffolded Next apps manually.
- Sandboxed `npm install` hit EPERM on nested package files; clean install via unrestricted runs.
- Supabase `create_project` failed: **2 free projects max** — reused grid150 with `alba_*` migrations.
- n8n Cloud iteration issues (fixed in exported JSON):
  - `$env` → `$vars`
  - empty Supabase list GETs halted the chain → `alwaysOutputData`
  - **Resolve Customer Id** crashed on create-branch (`Update Customer` not executed)
  - **Respond Success** too late / wrong `$json` → empty HTTP 200 body
  - Create Customer `on_conflict=email` invalid against `lower(email)` unique index → plain POST + `return=representation`
  - Code-node `throw` on customer/lead failure killed the webhook → now returns handled 500 JSON; OpenAI/insert failures detected via evaluate nodes (PostgREST `code` + missing `id`, not only `$json.error`); duplicate path PATCHes processing log to `success`
- Vercel blocked Next.js **15.1.0 / 15.2.4** (CVE-2025-66478); apps upgraded to **15.5.25** for deploy.

## How I verified it works

- `01-web-app` / `02-dashboard`: `npm run build` succeeded locally.
- n8n Production webhook: **HTTP 200** with reference **AC-42904** (retest7), lead + processing **success**, communications written.
- Vercel smoke: `POST https://alba-cars-web.vercel.app/api/inquiry` → **200** with reference **AC-85949**, `mode: n8n`.
- Dashboard / web production URLs return **200** (see Live links in [README.md](README.md)).

## Live surfaces

| Surface | URL |
| --- | --- |
| Web app | https://alba-cars-web.vercel.app |
| Dashboard | https://alba-cars-dashboard-dun.vercel.app |
| n8n Cloud | https://albacarsdemo.app.n8n.cloud (workflow Active, path `alba-inquiry`) |
| Repository | https://github.com/nathanbehailuz/alba-cars-ai-customer-desk |

## Known limitations

- Voice agent = queue status only (`ready_for_voice_agent` / `alba_voice_agent_queue`).
- Mocked vehicle stock only.
- Demo disclaimer required (not production Alba).
- Dashboard uses **service_role** server-side for demo reads (not production-hardened auth).

## Time spent

Rough: scaffold + PRD ~0.5h · schema ~0.5h · web app ~1.5h · dashboard ~1h · n8n/samples/wiring/fixes ~3h · Vercel + submission docs ~1h · error-handling polish ~0.5h.

## If I had more time

1. Wire Resend / WhatsApp Business so confirmation and sales-alert rows leave `skipped` and actually deliver.
2. Optional demo video for the submission form.
3. Simple dashboard auth or private Vercel protection for review.
4. Appointment calendar source beyond configurable `APPOINTMENT_URL`.
5. HTTP retry/backoff on OpenAI for flaky calls.