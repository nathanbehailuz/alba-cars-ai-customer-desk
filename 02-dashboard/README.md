# 02 — Dashboard

Lightweight internal UI over Supabase: leads, communications (messages), and AI sample evaluation runs.

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
| `/` | Leads table |
| `/leads/[id]` | Lead detail + messages + voice queue |
| `/messages` | All communications |
| `/eval` | `ai_eval_runs` sample GPT outputs |

## Verify

After n8n processes an inquiry, the lead and message rows appear here.
