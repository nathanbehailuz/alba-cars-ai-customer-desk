# Supabase

Migrations and local config for the ALBA inquiry CRM (PRD §7).

## Schema

| Migration | Purpose |
| --- | --- |
| [`migrations/20260320120000_init_alba_crm.sql`](./migrations/20260320120000_init_alba_crm.sql) | customers, leads, communications, appointments, voice_agent_queue, processing_log, ai_eval_runs, RLS, `AC-#####` reference helper |

## Apply

**Option A — Supabase Dashboard:** SQL Editor → paste migration → Run.

**Option B — MCP / CLI:** `apply_migration` against the linked project, or `supabase db push` after `supabase link`.

n8n must use the **service role** key (bypasses RLS). The browser anon key cannot insert leads; the widget posts only to n8n.

## Verify

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by 1;
```

Expect the seven CRM tables above.
