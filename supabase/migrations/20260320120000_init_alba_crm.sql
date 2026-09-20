-- ALBA CARS AI Customer Desk — initial CRM schema (PRD §7)
-- Apply via Supabase SQL editor or: supabase db push

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
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
  constraint customers_email_or_phone check (email is not null or phone is not null)
);

create unique index if not exists customers_email_unique
  on public.customers (lower(email))
  where email is not null;

create unique index if not exists customers_phone_unique
  on public.customers (phone)
  where phone is not null;

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  reference text not null unique,
  customer_id uuid not null references public.customers (id) on delete restrict,
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

create index if not exists leads_customer_id_idx on public.leads (customer_id);
create index if not exists leads_priority_idx on public.leads (priority);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- ---------------------------------------------------------------------------
-- communications (messages)
-- ---------------------------------------------------------------------------
create table if not exists public.communications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
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

create index if not exists communications_lead_id_idx on public.communications (lead_id);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete restrict,
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

-- ---------------------------------------------------------------------------
-- voice_agent_queue
-- ---------------------------------------------------------------------------
create table if not exists public.voice_agent_queue (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads (id) on delete cascade,
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

-- ---------------------------------------------------------------------------
-- processing_log
-- ---------------------------------------------------------------------------
create table if not exists public.processing_log (
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

create index if not exists processing_log_submission_id_idx
  on public.processing_log (submission_id);

-- ---------------------------------------------------------------------------
-- ai_eval_runs (sample GPT evaluation)
-- ---------------------------------------------------------------------------
create table if not exists public.ai_eval_runs (
  id uuid primary key default gen_random_uuid(),
  scenario_key text not null,
  input_payload jsonb not null,
  model text,
  output_json jsonb,
  latency_ms integer,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists ai_eval_runs_scenario_key_idx
  on public.ai_eval_runs (scenario_key);
create index if not exists ai_eval_runs_created_at_idx
  on public.ai_eval_runs (created_at desc);

-- ---------------------------------------------------------------------------
-- Reference number helper: AC-#####
-- ---------------------------------------------------------------------------
create sequence if not exists public.lead_reference_seq start 10000;

create or replace function public.next_lead_reference()
returns text
language sql
as $$
  select 'AC-' || nextval('public.lead_reference_seq')::text;
$$;

-- ---------------------------------------------------------------------------
-- RLS: deny public Data API access; n8n uses service_role (bypasses RLS)
-- Dashboard: add authenticated policies later or use service role server-side
-- ---------------------------------------------------------------------------
alter table public.customers enable row level security;
alter table public.leads enable row level security;
alter table public.communications enable row level security;
alter table public.appointments enable row level security;
alter table public.voice_agent_queue enable row level security;
alter table public.processing_log enable row level security;
alter table public.ai_eval_runs enable row level security;

-- Authenticated read for dashboard users (MVP)
create policy "authenticated_read_customers"
  on public.customers for select to authenticated using (true);
create policy "authenticated_read_leads"
  on public.leads for select to authenticated using (true);
create policy "authenticated_read_communications"
  on public.communications for select to authenticated using (true);
create policy "authenticated_read_appointments"
  on public.appointments for select to authenticated using (true);
create policy "authenticated_read_voice_agent_queue"
  on public.voice_agent_queue for select to authenticated using (true);
create policy "authenticated_read_processing_log"
  on public.processing_log for select to authenticated using (true);
create policy "authenticated_read_ai_eval_runs"
  on public.ai_eval_runs for select to authenticated using (true);

-- Anon has no policies → no public insert/select via anon key (widget → n8n only)
