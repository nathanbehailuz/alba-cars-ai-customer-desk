# Build Log: ALBA CARS AI Customer Desk

## Goal & scope decision

Built a monorepo per [docs/task.md](docs/task.md): marketing-site mimic + inquiry desk (`01-web-app`), Supabase-backed dashboard (`02-dashboard`), and n8n workflow package (`03-n8n-workflow`). Persistence is **Supabase** (not Google Sheets). WhatsApp bubble replaced by an on-site inquiry widget. Live inventory, real voice dialer, and production WhatsApp/email providers are deferred (bodies stored as `skipped`).

## Stack & tooling

| Piece | Choice | Why |
| --- | --- | --- |
| Web + dashboard | Next.js 15 App Router, TS, Tailwind | Fast multi-page UI + API route proxy to n8n |
| DB | Supabase Postgres + RLS | Assignment-friendly verifiable CRM; service role for n8n |
| Automation | n8n webhook export + local `run-samples.mjs` | Meets task.md; local runner unblocks GPT eval without Cloud |
| AI | OpenAI chat completions JSON mode | Classify, score, draft confirmation |

## Key decisions & trade-offs

- **Multi-page mimic (Home/Buy/Sell/Finance)** instead of widget-only — matches PRD lock and reviewer recognition of [albacars.ae](https://albacars.ae/).
- **Stub webhook** in `01-web-app` when `N8N_WEBHOOK_URL` unset — UI demoable before n8n is imported.
- **Communications `skipped`** without email/WhatsApp providers — still verifiable message content in Supabase/dashboard.
- **Local sample runner** mirrors n8n — verifies GPT behaviour and fills `ai_eval_runs` when Cloud env is delayed.
- **Did not apply schema to existing Supabase projects** (`nathanbehailuz's Project`, `grid150`) — they hold unrelated data; free-tier limit blocked a new project.

## Hard parts / dead ends

- `create-next-app` refused the workspace path (false “not writable”); scaffolded Next apps manually.
- Sandboxed `npm install` hit EPERM on nested package files; clean install/build via unrestricted agent runs.
- Supabase `create_project` failed: **2 free projects max** for the org owner. Schema lives in `supabase/migrations` awaiting apply.
- GitHub CLI tokens invalid / Connect SCM timed out — commits are local only until re-auth + remote.

## How I verified it works

- `01-web-app`: `npm run build` succeeded (routes `/`, `/buy`, `/sell`, `/finance`, `/api/inquiry`).
- `02-dashboard`: `npm run build` succeeded (leads, messages, eval, lead detail).
- n8n: importable `alba-inquiry-workflow.json` + sample payloads + documented verify steps.
- End-to-end against live Supabase + OpenAI + n8n: **pending credentials** (see below).

## Known limitations

- No live Supabase project linked yet → dashboard shows config banner until env + migration applied.
- No live n8n instance URL in README yet.
- Email/WhatsApp delivery not wired (stored as skipped).
- Voice agent = queue status only.
- Mocked vehicle stock only.
- Demo disclaimer required (not production alba).
- Next.js 15.1.0 may need upgrade for upstream CVE advisories.

## Time spent

Rough: scaffold + PRD alignment ~0.5h · schema ~0.5h · web app ~1.5h · dashboard ~1h · n8n/samples/runner ~1.5h · docs/build log ~0.5h.

## Blockers for you

1. **Supabase:** Pause or upgrade one free project, or tell me which existing project may receive the Alba migrations — then I apply SQL + share URL/anon keys into `.env.example` comments (not secrets in git).
2. **OpenAI:** Provide `OPENAI_API_KEY` (local env only) to run `node 03-n8n-workflow/scripts/run-samples.mjs`.
3. **GitHub:** Run `gh auth login`, then I can `gh repo create` + push all phase commits.
4. **n8n Cloud:** Import JSON and paste webhook URL into `01-web-app` `.env.local`.
