# Activate the n8n workflow

Import [`alba-inquiry-workflow.json`](./alba-inquiry-workflow.json), set Variables, and turn the workflow **Active** so the Production webhook stops returning 404.

**Reviewer login** for the live instance is in the Notes on the [Alba Dev Tests submission](https://devtest.albacars.ae/apply/onfbdgbvtx2hgz/test/6a4669f22063428fcf521f77) — never commit passwords to git.

---

## Variables (n8n Cloud)

Cloud blocks `$env.*`. This workflow uses **`$vars.*`**.

Create under **Personal → Variables** (or Overview → Variables). Placeholders only — never real secrets in the repo:

| Key | Example / notes |
| --- | --- |
| `OPENAI_API_KEY` | your `sk-…` key |
| `OPENAI_MODEL` | `gpt-5-nano` |
| `SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role JWT (`eyJ…`) |

Optional: `EMAIL_PROVIDER`, `WHATSAPP_PROVIDER`, `SALES_ALERT_PROVIDER` (if unset, communications store as `skipped`).

See also [`.env.example`](./.env.example).

---

## Steps

1. Open https://albacarsdemo.app.n8n.cloud and sign in.
2. Add the Variables above.
3. **Workflows** → import `alba-inquiry-workflow.json`.  
   If an older copy exists, delete it or re-import so expressions use `$vars` and error paths use evaluate + Respond nodes.
4. Confirm webhook path is `alba-inquiry`.
5. **Save** → toggle **Active / Published** ON.
6. Copy the **Production** webhook URL into `01-web-app/.env.local` as `N8N_WEBHOOK_URL`.
7. Restart the web app if it is already running.

---

## Quick test

```bash
curl -sS -X POST "$N8N_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d '{"submission_id":"33333333-3333-4333-8333-333333333301","intent":"buy","category_seed":"vehicle_purchase","name":"Test","email":"test@example.com","preferred_channel":"email","message":"Toyota RAV4 under 130000","contact_consent":true,"whatsapp_consent":false,"voice_consent":false,"page_context":{"source":"curl","page_type":"buy","submitted_at":"2026-03-20T12:00:00.000Z"}}'
```

Expect JSON with `reference` like `AC-#####`. Then confirm a row on the [dashboard](https://alba-cars-dashboard-dun.vercel.app) or in Supabase `alba_leads`.

### Common symptoms

| Symptom | Likely cause |
| --- | --- |
| **404** | Workflow not Active |
| **500** + `access to env vars denied` | Still on `$env` — re-import `$vars` export and set Variables |
| **200** empty body | Stale export — respond must run after **Attach Lead Id**; list GETs need `alwaysOutputData` |
| **500** customer upsert / missing branch | Stale **Resolve Customer Id** / lookup — re-import current JSON |
| **500** OpenAI / Supabase | Wrong Variable values |

---

## Repo fallback

Without Cloud: `01-web-app/src/lib/pipeline.ts` with `INQUIRY_PIPELINE=auto|local` (OpenAI + Supabase service role in app env).
