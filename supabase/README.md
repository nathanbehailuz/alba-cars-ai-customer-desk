# Supabase

Migrations for the ALBA inquiry CRM.

## Shared project note (grid150)

Tables are **prefixed** so they do not collide with existing grid150 tables (`topics`, `problems`, …):

| Table / object |
| --- |
| `alba_customers` |
| `alba_leads` |
| `alba_communications` |
| `alba_appointments` |
| `alba_voice_agent_queue` |
| `alba_processing_log` |
| `alba_ai_eval_runs` |
| `alba_next_lead_reference()` |

Primary migration: [`migrations/20260320130000_alba_prefixed_tables.sql`](./migrations/20260320130000_alba_prefixed_tables.sql)

n8n and the local runner must use the **service role** key (bypasses RLS). Widget → n8n only; anon cannot insert.

## Apply

Already applied to project `gvtprsfkvhdwbfvwynog` (grid150) via MCP. Re-apply from SQL editor if needed.
