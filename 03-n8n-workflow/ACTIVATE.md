# Activate the n8n workflow (item 3)

The export in this folder is already written. You only need to **import + turn it on** in n8n Cloud so the Production webhook stops returning 404.

## Critical (n8n Cloud)

Cloud **blocks** `$env.*` (“access to env vars denied”). This workflow uses **`$vars.*`**.

Create variables under **Personal → Variables** (or Overview → Variables):

| Key | Value |
| --- | --- |
| `OPENAI_API_KEY` | your `sk-…` key |
| `OPENAI_MODEL` | `gpt-5-nano` |
| `SUPABASE_URL` | `https://gvtprsfkvhdwbfvwynog.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase **service_role** JWT (`eyJ…` with role service_role) |

Optional (if used by nodes): `EMAIL_PROVIDER`, `WHATSAPP_PROVIDER`, `SALES_ALERT_PROVIDER`.

## Steps (n8n Cloud)

1. Open [https://albacarsdemo.app.n8n.cloud](https://albacarsdemo.app.n8n.cloud) and sign in.
2. Add the **Variables** above.
3. **Workflows** → import `03-n8n-workflow/alba-inquiry-workflow.json`  
   (If an older copy exists, delete it or re-import so expressions use `$vars`, not `$env`.)
4. Confirm Webhook path is `alba-inquiry`.
5. **Save** → toggle **Active / Published** ON.
6. Copy **Production** webhook URL into `01-web-app/.env.local` as `N8N_WEBHOOK_URL`.
7. Restart `npm run dev` if the app is running.

## Quick test

```bash
curl -sS -X POST "$N8N_WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d '{"submission_id":"33333333-3333-4333-8333-333333333301","intent":"buy","category_seed":"vehicle_purchase","name":"Test","email":"test@example.com","preferred_channel":"email","message":"Toyota RAV4 under 130000","contact_consent":true,"whatsapp_consent":false,"voice_consent":false,"page_context":{"source":"curl","page_type":"buy","submitted_at":"2026-03-20T12:00:00.000Z"}}'
```

Expect JSON with `reference` like `AC-#####`.

| Symptom | Meaning |
| --- | --- |
| **404** | Workflow not Active |
| **500** + `access to env vars denied` | Still using `$env` — re-import `$vars` JSON + set Variables |
| **200 empty body**, run still succeeds in Supabase | **Respond Success** was after comms + **Log Processing Success** (PATCH output has no `reference`) or webhook timed out — re-import JSON that responds right after **Attach Lead Id** with `submission_id` |
| **200 empty body**, log stuck at `processing` | **Check Duplicate Lead** returned `[]` (0 items) and n8n stopped the chain — re-import JSON with `alwaysOutputData` on list GETs |
| **500** + `Node 'Update Customer' hasn't been executed` | **Resolve Customer Id** read the unused branch — re-import JSON that uses `$input` / `.isExecuted` |
| **500** + Supabase/OpenAI error | Wrong Variable values / keys |

## Already automated in this repo

In-app fallback: `01-web-app/src/lib/pipeline.ts` with `INQUIRY_PIPELINE=auto|local`.
