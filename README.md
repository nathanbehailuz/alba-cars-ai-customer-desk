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
2. Apply Supabase migrations under `supabase/migrations`.
3. Run `01-web-app` and `02-dashboard` (see each folder README).
4. Import `03-n8n-workflow` into [n8n Cloud](https://n8n.io/) and set credentials.

## Live links

| Surface | URL |
| --- | --- |
| Web app | _TBD after deploy_ |
| Dashboard | _TBD after deploy_ |
| n8n | _TBD — cloud instance or exported JSON_ |

## Security

Never commit API keys, Supabase service role keys, or n8n credentials.
