# 03 — n8n workflow

Lead acquisition pipeline: webhook → validate → OpenAI → Supabase → confirmations / sales alert.

Satisfies [docs/task.md](../docs/task.md): trigger, external API, transform, branching, error handling, verifiable output.

## Contents

| File | Purpose |
| --- | --- |
| `README.md` | This file — setup, nodes, verify |
| `alba-inquiry-workflow.json` | Exported workflow (added in later phase) |
| `sample-payloads/` | Canned inquiries for AI evaluation |

## Credentials needed (placeholders)

- OpenAI API key
- Supabase URL + service role (HTTP Request / Supabase node)
- Optional: Resend / email, WhatsApp, Slack for sales alerts

## How to run

1. Import JSON into n8n Cloud (or self-host).
2. Set credentials; activate webhook.
3. Copy production webhook URL into `01-web-app` `.env.local` as `NEXT_PUBLIC_N8N_WEBHOOK_URL`.
4. Submit from the widget or POST a sample payload.

## How to verify

- Supabase: new rows in `customers`, `leads`, `communications`, `processing_log`
- Customer receives confirmation (or row marked `sent` / logged body)
- Hot lead triggers sales alert
- Re-POST same `submission_id` → no duplicate lead

## Node walkthrough

Documented after the workflow JSON is exported (Phase 5).
