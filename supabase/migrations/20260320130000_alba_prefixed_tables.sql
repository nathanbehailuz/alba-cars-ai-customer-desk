-- ALBA CRM on shared grid150 project — prefixed tables so they stay separate
-- from existing public.topics / problems / profiles / etc.

create extension if not exists "pgcrypto";

create table if not exists public.alba_customers (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  preferred_channel text check (preferred_channel in ('email', 'whatsapp', 'both')),
  contact_consent boolean not null default false,
  whatsapp_consent boolean not null default false,
  voice_consent boolean not null default false,
  first_contact_at timestamptz not null default now(),
  last_contact_at timestamptz not null default now(),
  assigned_agent text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint alba_customers_email_or_phone check (email is not null or phone is not null)
);

create unique index if not exists alba_customers_email_unique
  on public.alba_customers (lower(email))
  where email is not null;

create unique index if not exists alba_customers_phone_unique
  on public.alba_customers (phone)
  where phone is not null;

create table if not exists public.alba_leads (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  reference text not null unique,
  customer_id uuid not null references public.alba_customers (id) on delete restrict,
  category text,
  intent text,
  original_message text,
  ai_summary text,
  ai_raw jsonb,
  vehicle_interest text,
  vehicle_id text,
  budget_aed numeric,
  buying_timeline text,
  buying_intent text,
  urgency text,
  lead_score integer check (lead_score is null or (lead_score >= 0 and lead_score <= 100)),
  priority text check (priority is null or priority in ('hot', 'warm', 'early')),
  recommended_action text,
  recommended_cta text,
  status text not null default 'open',
  source_page text,
  page_context jsonb not null default '{}'::jsonb,
  assigned_team text,
  assigned_agent text,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists alba_leads_customer_id_idx on public.alba_leads (customer_id);
create index if not exists alba_leads_priority_idx on public.alba_leads (priority);
create index if not exists alba_leads_created_at_idx on public.alba_leads (created_at desc);

create table if not exists public.alba_communications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.alba_leads (id) on delete cascade,
  channel text not null check (channel in ('email', 'whatsapp', 'sales_alert', 'system')),
  message_type text not null check (message_type in ('confirmation', 'alert', 'fallback')),
  content text not null,
  delivery_status text not null default 'pending'
    check (delivery_status in ('pending', 'sent', 'failed', 'skipped')),
  provider_message_id text,
  error_details text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists alba_communications_lead_id_idx on public.alba_communications (lead_id);

create table if not exists public.alba_appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.alba_leads (id) on delete cascade,
  customer_id uuid not null references public.alba_customers (id) on delete restrict,
  appointment_type text not null
    check (appointment_type in ('consultation', 'test_drive', 'valuation', 'financing')),
  requested_at timestamptz,
  confirmed_at timestamptz,
  vehicle text,
  assigned_agent text,
  booking_source text check (booking_source in ('widget', 'voice', 'sales')),
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alba_voice_agent_queue (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.alba_leads (id) on delete cascade,
  customer_name text,
  phone text not null,
  preferred_language text,
  ai_summary text,
  suggested_opening text,
  status text not null default 'not_queued'
    check (status in (
      'not_queued',
      'ready',
      'queued',
      'call_attempted',
      'appointment_scheduled',
      'no_answer',
      'human_follow_up'
    )),
  call_result text,
  appointment_outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alba_processing_log (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null,
  workflow_run_id text,
  status text not null
    check (status in ('processing', 'success', 'partial', 'failed')),
  retry_count integer not null default 0,
  error_stage text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists alba_processing_log_submission_id_idx
  on public.alba_processing_log (submission_id);

create table if not exists public.alba_ai_eval_runs (
  id uuid primary key default gen_random_uuid(),
  scenario_key text not null,
  input_payload jsonb not null,
  model text,
  output_json jsonb,
  latency_ms integer,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists alba_ai_eval_runs_scenario_key_idx
  on public.alba_ai_eval_runs (scenario_key);
create index if not exists alba_ai_eval_runs_created_at_idx
  on public.alba_ai_eval_runs (created_at desc);

create sequence if not exists public.alba_lead_reference_seq start 10000;

create or replace function public.alba_next_lead_reference()
returns text
language sql
as $$
  select 'AC-' || nextval('public.alba_lead_reference_seq')::text;
$$;

grant usage on sequence public.alba_lead_reference_seq to service_role, authenticated;
grant execute on function public.alba_next_lead_reference() to service_role, authenticated;

alter table public.alba_customers enable row level security;
alter table public.alba_leads enable row level security;
alter table public.alba_communications enable row level security;
alter table public.alba_appointments enable row level security;
alter table public.alba_voice_agent_queue enable row level security;
alter table public.alba_processing_log enable row level security;
alter table public.alba_ai_eval_runs enable row level security;

create policy "alba_authenticated_read_customers"
  on public.alba_customers for select to authenticated using (true);
create policy "alba_authenticated_read_leads"
  on public.alba_leads for select to authenticated using (true);
create policy "alba_authenticated_read_communications"
  on public.alba_communications for select to authenticated using (true);
create policy "alba_authenticated_read_appointments"
  on public.alba_appointments for select to authenticated using (true);
create policy "alba_authenticated_read_voice_agent_queue"
  on public.alba_voice_agent_queue for select to authenticated using (true);
create policy "alba_authenticated_read_processing_log"
  on public.alba_processing_log for select to authenticated using (true);
create policy "alba_authenticated_read_ai_eval_runs"
  on public.alba_ai_eval_runs for select to authenticated using (true);
