create extension if not exists pgcrypto with schema extensions;

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create type public.lead_status as enum (
  'new',
  'reviewed',
  'contacted',
  'qualified',
  'won',
  'lost',
  'spam'
);

create type public.ai_task_kind as enum ('lead_intake', 'site_chat');
create type public.ai_task_state as enum (
  'queued',
  'leased',
  'running',
  'completed',
  'needs_human',
  'cancelled'
);
create type public.chat_session_status as enum ('active', 'escalated', 'closed');
create type public.chat_message_role as enum ('user', 'assistant');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  client_request_id uuid not null unique,
  status public.lead_status not null default 'new',
  source text not null default 'website',
  page_url text,
  name text not null,
  phone text not null,
  email text,
  object_type text,
  size_notes text,
  material text,
  message text,
  consent boolean not null default false,
  utm jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  request_fingerprint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_name_length check (char_length(name) between 1 and 160),
  constraint leads_phone_length check (char_length(phone) between 5 and 80),
  constraint leads_message_length check (message is null or char_length(message) <= 12000),
  constraint leads_consent_required check (consent)
);

create index leads_status_created_idx on public.leads (status, created_at desc);
create index leads_fingerprint_created_idx on public.leads (request_fingerprint, created_at desc)
  where request_fingerprint is not null;

create table public.lead_files (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  bucket text not null default 'lead-files',
  object_path text not null unique,
  original_name text not null,
  mime_type text not null,
  byte_size bigint not null,
  created_at timestamptz not null default now(),
  constraint lead_files_size check (byte_size > 0 and byte_size <= 10485760),
  constraint lead_files_bucket check (bucket = 'lead-files')
);

create index lead_files_lead_idx on public.lead_files (lead_id, created_at);

create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  public_token_hash text not null unique,
  status public.chat_session_status not null default 'active',
  source text not null default 'website-chat',
  page_url text,
  contact_name text,
  contact_phone text,
  request_fingerprint text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index chat_sessions_activity_idx on public.chat_sessions (status, last_message_at desc);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role public.chat_message_role not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint chat_messages_content_length check (char_length(content) between 1 and 4000)
);

create index chat_messages_session_idx on public.chat_messages (session_id, created_at, id);

create table public.ai_tasks (
  id uuid primary key default gen_random_uuid(),
  kind public.ai_task_kind not null,
  state public.ai_task_state not null default 'queued',
  lead_id uuid references public.leads(id) on delete cascade,
  chat_session_id uuid references public.chat_sessions(id) on delete cascade,
  chat_message_id uuid references public.chat_messages(id) on delete cascade,
  priority smallint not null default 100,
  payload jsonb not null default '{}'::jsonb,
  output jsonb,
  attempt_number smallint not null default 1,
  next_attempt_at timestamptz not null default now(),
  leased_by text,
  lease_expires_at timestamptz,
  heartbeat_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_tasks_priority check (priority between 1 and 1000),
  constraint ai_tasks_attempt check (attempt_number between 1 and 3),
  constraint ai_tasks_target check (
    (kind = 'lead_intake' and lead_id is not null and chat_session_id is null and chat_message_id is null)
    or
    (kind = 'site_chat' and lead_id is null and chat_session_id is not null and chat_message_id is not null)
  )
);

create unique index ai_tasks_lead_once_idx on public.ai_tasks (lead_id)
  where kind = 'lead_intake';
create unique index ai_tasks_chat_message_once_idx on public.ai_tasks (chat_message_id)
  where kind = 'site_chat';
create index ai_tasks_claim_idx on public.ai_tasks (state, next_attempt_at, priority, created_at)
  where state in ('queued', 'leased', 'running');

create table public.lead_ai_reviews (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  ai_task_id uuid not null unique references public.ai_tasks(id) on delete cascade,
  summary text not null,
  category text not null,
  priority text not null,
  completeness smallint not null,
  missing_questions jsonb not null default '[]'::jsonb,
  flags jsonb not null default '[]'::jsonb,
  manager_reply_draft text not null,
  model text,
  created_at timestamptz not null default now(),
  constraint lead_ai_reviews_completeness check (completeness between 0 and 100),
  constraint lead_ai_reviews_priority check (priority in ('low', 'normal', 'high', 'urgent'))
);

create index lead_ai_reviews_lead_idx on public.lead_ai_reviews (lead_id, created_at desc);

create table public.worker_heartbeats (
  worker_key text primary key,
  worker_name text not null,
  state text not null default 'online',
  current_task_id uuid references public.ai_tasks(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint worker_heartbeat_state check (state in ('online', 'busy', 'offline', 'error'))
);

create function app_private.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function app_private.touch_updated_at() from public, anon, authenticated;

create trigger leads_touch_updated_at
before update on public.leads
for each row execute function app_private.touch_updated_at();

create trigger chat_sessions_touch_updated_at
before update on public.chat_sessions
for each row execute function app_private.touch_updated_at();

create trigger ai_tasks_touch_updated_at
before update on public.ai_tasks
for each row execute function app_private.touch_updated_at();

create trigger worker_heartbeats_touch_updated_at
before update on public.worker_heartbeats
for each row execute function app_private.touch_updated_at();

alter table public.leads enable row level security;
alter table public.lead_files enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ai_tasks enable row level security;
alter table public.lead_ai_reviews enable row level security;
alter table public.worker_heartbeats enable row level security;

revoke all on table
  public.leads,
  public.lead_files,
  public.chat_sessions,
  public.chat_messages,
  public.ai_tasks,
  public.lead_ai_reviews,
  public.worker_heartbeats
from anon, authenticated;

grant select, insert, update, delete on table
  public.leads,
  public.lead_files,
  public.chat_sessions,
  public.chat_messages,
  public.ai_tasks,
  public.lead_ai_reviews,
  public.worker_heartbeats
to service_role;
