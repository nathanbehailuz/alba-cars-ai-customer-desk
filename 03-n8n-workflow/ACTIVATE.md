# Activate the n8n workflow (item 3)

The export in this folder is already written. You only need to **import + turn it on** in n8n Cloud so the Production webhook stops returning 404.

## Steps (n8n Cloud)

1. Open [https://albacarsdemo.app.n8n.cloud](https://albacarsdemo.app.n8n.cloud) (or your n8n host) and sign in.
2. **Workflows** → **Add workflow** → **⋯** / **Import from File** → choose  
   `03-n8n-workflow/alba-inquiry-workflow.json`  
   (If you already imported an older copy, delete it or re-import so table names are `alba_*`.)
3. Open the workflow. Confirm the **Webhook** node path is `alba-inquiry`.
4. Set environment variables (n8n → Settings → Variables, or workflow env):
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` = `gpt-5-nano`
   - `SUPABASE_URL` = `https://gvtprsfkvhdwbfvwynog.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = the **service_role** JWT from Supabase (starts with `eyJ…`, not `sk-…`, not the anon key)
5. Click **Save**, then toggle **Active** (top right) to **ON**.
6. Open the Webhook node → copy **Production URL**  
   (should look like `https://albacarsdemo.app.n8n.cloud/webhook/alba-inquiry`).
7. Put that URL in `01-web-app/.env.local` as `N8N_WEBHOOK_URL=…` and restart `npm run dev`.

## Quick test

```bash
jq .payload sample-payloads/01-high-intent-rav4.json | \
  curl -sS -X POST "$N8N_WEBHOOK_URL" -H 'Content-Type: application/json' -d @-
```

Expect JSON with `reference` like `AC-#####`. A **404** means the workflow is still inactive or the URL is the Test URL while nothing is listening.

## Already automated in this repo

You do **not** have to wait on n8n for a working demo:

- `01-web-app` local pipeline (`src/lib/pipeline.ts`) runs the same flow: validate → GPT → `alba_*` tables → messages.
- Set in `01-web-app/.env.local`:
  - `INQUIRY_PIPELINE=local` (or leave `auto`: tries n8n, falls back to local)
  - `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-5-nano`
  - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (**must** be the `eyJ…` service_role secret)

For the **assignment hand-in**, still activate n8n and include the live instance / exported JSON per [docs/task.md](../docs/task.md).
