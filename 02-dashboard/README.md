# 02 — Dashboard

Lightweight internal UI over Supabase: leads, communications (messages), voice queue status, and AI sample evaluation runs.

## Stack (planned)

- Next.js (App Router) + TypeScript
- `@supabase/supabase-js` (anon + optional simple auth)

## Run

```bash
cd 02-dashboard
cp ../.env.example .env.local
npm install
npm run dev
```

Use a different port if the web app is already on 3000 (e.g. `npm run dev -- -p 3001`).

## Views (MVP)

- Leads list + detail (score, summary, reference)
- Communications / messages by lead
- AI eval runs (sample pack outputs)

## Env

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Service role stays server-side / n8n only.

## Verify

After a successful webhook run, a new lead and communication rows appear here.
