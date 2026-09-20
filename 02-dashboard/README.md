# 02 — Dashboard

Internal UI over Supabase: form submissions inbox, communications, and AI sample evaluation runs.

**Production:** https://alba-cars-dashboard-dun.vercel.app

> Note: `alba-cars-dashboard.vercel.app` is a **different** app (Alba OS Sales CRM). Use the `-dun` URL above for this inquiry-desk dashboard.

## Stack

- Next.js 15 + TypeScript + Tailwind
- `@supabase/supabase-js` (prefer `SUPABASE_SERVICE_ROLE_KEY` server-side for MVP reads with RLS)

## Run

```bash
cd 02-dashboard
cp ../.env.example .env.local
npm install
npm run dev
```

Defaults to [http://localhost:3001](http://localhost:3001).

## Views

| Route | Purpose |
| --- | --- |
| `/` | **Submissions** table — when, ref, contact, department (AI category), AI summary, confirmation message. Filters: date (today / week / month) + department |
| `/leads/[id]` | Full submission detail, confirmation callout, all messages, voice queue, **prior fills** by same customer / email / phone |
| `/messages` | All communications |
| `/eval` | `ai_eval_runs` sample GPT outputs |

## Verify

1. Submit an inquiry from the web app (or n8n webhook).
2. Open `/` — row shows department + confirmation snippet.
3. Open a row — see full info and any earlier submissions from the same person.
