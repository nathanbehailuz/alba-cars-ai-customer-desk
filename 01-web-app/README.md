# 01 — Web app

Public multi-page mimic of [albacars.ae](https://albacars.ae/) with the **inquiry desk** replacing the WhatsApp bubble.

## Stack (planned)

- Next.js (App Router) + TypeScript
- Posts inquiries to the n8n webhook (`NEXT_PUBLIC_N8N_WEBHOOK_URL`)

## Run

```bash
cd 01-web-app
cp ../.env.example .env.local   # fill values
npm install
npm run dev
```

## Pages

- `/` Home
- `/buy` Inventory (mocked)
- `/sell` Sell / trade-in
- `/finance` Financing

## Env

See root [`.env.example`](../.env.example). Never commit secrets.

## Verify

1. Open Home — brand hero, nav, no WhatsApp bubble as primary CTA.
2. Open inquiry desk → pick intent → submit with email or phone.
3. Network tab shows POST to n8n webhook (or mock during local stub).
