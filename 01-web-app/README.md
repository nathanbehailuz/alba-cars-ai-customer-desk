# 01 — Web app

Public multi-page mimic of [albacars.ae](https://albacars.ae/) with the **inquiry desk** replacing the WhatsApp bubble.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Posts inquiries to `/api/inquiry` → n8n webhook (`N8N_WEBHOOK_URL` / `NEXT_PUBLIC_N8N_WEBHOOK_URL`)
- Stub mode when webhook env is unset (returns a fake `AC-#####` for UI demos)

## Run

```bash
cd 01-web-app
cp ../.env.example .env.local   # fill values
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home hero, deals, trust strip |
| `/buy` | Mocked inventory + filters; `?vehicle=` attaches context |
| `/sell` | Sell / trade-in CTA into widget |
| `/finance` | Finance eligibility CTA into widget |

## Verify

1. No WhatsApp bubble as primary contact — gold **How can we help?** desk bottom-right.
2. Six intents → form validation (email or phone; channel rules; consent).
3. From `/buy?vehicle=veh-rav4-2023`, submit — payload includes vehicle context.
4. With webhook unset, success screen still shows a reference (stub).

## Env

See root [`.env.example`](../.env.example). Never commit secrets.
