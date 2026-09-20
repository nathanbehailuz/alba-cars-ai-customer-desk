# ALBA CARS AI Customer Desk

Website inquiry desk, AI lead qualification, and n8n automation for ALBA CARS — replacing the WhatsApp-only contact bubble with an on-site form that writes to Supabase.

> Demo prototype inspired by [albacars.ae](https://albacars.ae/). Not the production Alba Cars website.

## Monorepo (per assignment)

| Folder | What it is |
| --- | --- |
| [`01-web-app`](./01-web-app) | Multi-page marketing mimic + inquiry widget |
| [`02-dashboard`](./02-dashboard) | Internal view of leads, messages, AI sample runs |
| [`03-n8n-workflow`](./03-n8n-workflow) | Exported n8n workflow + setup README |

## Docs

- [PRD](./docs/prd.md) — build contract
- [Project brief](./docs/project-brief.md) — product narrative
- [Task / hand-in rules](./docs/task.md) — n8n assignment checklist
- [BUILD_LOG.md](./BUILD_LOG.md) — decisions and verification notes

## Quick start

1. Copy [`.env.example`](./.env.example) → `.env` / each app’s `.env.local` (no real secrets in git).
2. Apply SQL in [`supabase/migrations`](./supabase/migrations) to a Supabase project (service role for n8n).
3. Web app: `cd 01-web-app && npm install && npm run dev` → [http://localhost:3000](http://localhost:3000)
4. Dashboard: `cd 02-dashboard && npm install && npm run dev` → [http://localhost:3001](http://localhost:3001)
5. Import [`03-n8n-workflow/alba-inquiry-workflow.json`](./03-n8n-workflow/alba-inquiry-workflow.json) into [n8n](https://n8n.io/); set `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
6. Optional GPT sample pack: `node 03-n8n-workflow/scripts/run-samples.mjs` (see workflow README).

## Live links

| Surface | URL |
| --- | --- |
| Web app | Local `3000` — deploy TBD |
| Dashboard | Local `3001` — deploy TBD |
| n8n | Import exported JSON in `03-n8n-workflow/` |

## Security

Never commit API keys, Supabase service role keys, or n8n credentials.
