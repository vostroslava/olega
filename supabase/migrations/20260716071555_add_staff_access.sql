create type public.staff_role as enum ('admin', 'manager');

create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.staff_role not null default 'manager',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_members_email_lowercase check (email = lower(email)),
  constraint staff_members_name_length check (full_name is null or char_length(full_name) <= 160)
);

create index staff_members_role_idx on public.staff_members (role, created_at);

create table public.admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  request_fingerprint text not null,
  created_at timestamptz not null default now()
);

create index admin_login_attempts_fingerprint_idx
  on public.admin_login_attempts (request_fingerprint, created_at desc);

create trigger staff_members_touch_updated_at
before update on public.staff_members
for each row execute function app_private.touch_updated_at();

alter table public.staff_members enable row level security;
alter table public.admin_login_attempts enable row level security;

revoke all on table public.staff_members, public.admin_login_attempts from anon, authenticated;
grant select, insert, update, delete on table public.staff_members, public.admin_login_attempts to service_role;
