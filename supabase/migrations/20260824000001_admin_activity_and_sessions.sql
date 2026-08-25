-- ============================================================================
-- Trusta Brand Portal — Admin Module: Activity Logs, Active Sessions,
-- account suspension flag.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles.is_suspended — used by the admin User Management "suspend" action.
-- Checked at login and defensively in the dashboard/purchase guards.
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_suspended boolean not null default false;

-- ----------------------------------------------------------------------------
-- activity_logs — append-only event feed. Written only by trusted
-- server-side code paths via the service-role client (login, logout,
-- profile updates, purchases, upload attempts, verification submissions).
-- Regular users get no insert/select policy at all — only admins can read.
-- ----------------------------------------------------------------------------
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null check (event_type in (
    'login',
    'logout',
    'profile_update',
    'purchase',
    'upload_attempt',
    'verification_submitted'
  )),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_user_id_idx on public.activity_logs (user_id);
create index activity_logs_event_type_idx on public.activity_logs (event_type);
create index activity_logs_created_at_idx on public.activity_logs (created_at desc);

alter table public.activity_logs enable row level security;

create policy "activity_logs: admin read all"
  on public.activity_logs for select
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- user_sessions — one row per login. Closed out on logout, kept warm by a
-- client-side heartbeat while the tab is open. Written only via service role.
-- ----------------------------------------------------------------------------
create table public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  login_at timestamptz not null default now(),
  logout_at timestamptz,
  last_seen_at timestamptz not null default now(),
  duration_seconds integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index user_sessions_user_id_idx on public.user_sessions (user_id);
create index user_sessions_is_active_idx on public.user_sessions (is_active);
create index user_sessions_last_seen_at_idx on public.user_sessions (last_seen_at desc);

alter table public.user_sessions enable row level security;

create policy "user_sessions: admin read all"
  on public.user_sessions for select
  using (public.is_admin());
