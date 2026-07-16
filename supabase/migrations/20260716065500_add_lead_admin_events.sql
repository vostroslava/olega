create type public.lead_event_kind as enum (
  'created',
  'status_changed',
  'notification_sent',
  'notification_failed'
);

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  kind public.lead_event_kind not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  from_status public.lead_status,
  to_status public.lead_status,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint lead_events_status_change_check check (
    (kind = 'status_changed' and from_status is not null and to_status is not null)
    or
    (kind <> 'status_changed' and from_status is null and to_status is null)
  )
);

create index lead_events_lead_created_idx on public.lead_events (lead_id, created_at desc);

alter table public.lead_events enable row level security;

revoke all on table public.lead_events from anon, authenticated;
grant select, insert, update, delete on table public.lead_events to service_role;
