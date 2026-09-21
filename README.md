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
2. Apply SQL in [`supabase/migrations`](./supabase/migrations) to a Supabase project (service role for n8n). Prefixed `alba_*` tables are already live on grid150.
3. Web app: `cd 01-web-app && npm install && npm run dev` → [http://localhost:3000](http://localhost:3000)
4. Dashboard: `cd 02-dashboard && npm install && npm run dev` → [http://localhost:3001](http://localhost:3001)
5. Import [`03-n8n-workflow/alba-inquiry-workflow.json`](./03-n8n-workflow/alba-inquiry-workflow.json) into n8n; set Cloud **Variables** (`$vars`) for OpenAI + Supabase service role — see [ACTIVATE.md](./03-n8n-workflow/ACTIVATE.md).
6. Optional GPT sample pack: `node 03-n8n-workflow/scripts/run-samples.mjs` (see workflow README).

## Live links

Stable production aliases (use these):

| Surface | URL |
| --- | --- |
| Web app | https://alba-cars-web.vercel.app |
| Dashboard | https://alba-cars-dashboard-dun.vercel.app |
| n8n | https://albacarsdemo.app.n8n.cloud (Active; path `alba-inquiry`) |
| Repository | https://github.com/nathanbehailuz/alba-cars-ai-customer-desk |

Vercel also creates temporary per-deployment hostnames (long `*-natecodes-projects.vercel.app` URLs) — ignore those for sharing. Production aliases above are the stable links.

**Reviewer access:** n8n Cloud login is in the Notes on the [Alba Dev Tests submission](https://devtest.albacars.ae/apply/onfbdgbvtx2hgz/test/6a4669f22063428fcf521f77) (never committed to git). Fallback: import [`03-n8n-workflow/alba-inquiry-workflow.json`](./03-n8n-workflow/alba-inquiry-workflow.json) and follow [`03-n8n-workflow/ACTIVATE.md`](./03-n8n-workflow/ACTIVATE.md). Full workflow docs: [`03-n8n-workflow/README.md`](./03-n8n-workflow/README.md).

## Security

Never commit API keys, Supabase service role keys, or n8n credentials.
