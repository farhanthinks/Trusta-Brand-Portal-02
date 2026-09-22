  -- ============================================================================
  -- Trusta Brand Portal — Logout & session-expiry tracking.
  --
  -- 1. activity_logs.session_id: correlates an activity event with the exact
  --    user_sessions row it happened during (a user can be logged in from more
  --    than one device, so user_id alone doesn't identify "which session").
  -- 2. event_type gains 'session_expired' — a session closed automatically by
  --    the heartbeat-timeout sweep below, distinct from an explicit 'logout'
  --    click.
  -- 3. expire_stale_sessions(): closes out user_sessions rows whose heartbeat
  --    has gone quiet for longer than the timeout (default 180s / 3 min,
  --    matching lib/admin/sessions.ts's ACTIVE_WINDOW_SECONDS) — is_active,
  --    logout_at, duration_seconds are all set the same way an explicit
  --    logout would set them. Runs as SECURITY DEFINER so it can update rows
  --    across all users, but it does no per-caller authorization check
  --    (unlike get_brand_activity_summary) because it's meant to be triggered
  --    opportunistically by ANY authenticated user's heartbeat ping, not just
  --    an admin — so instead it's locked down at the grant level: only the
  --    service_role (server-side only, never the browser) may call it.
  -- ============================================================================

  alter table public.activity_logs
    add column if not exists session_id uuid references public.user_sessions (id) on delete set null;

  create index if not exists activity_logs_session_id_idx on public.activity_logs (session_id);

  alter table public.activity_logs
    drop constraint if exists activity_logs_event_type_check;

  alter table public.activity_logs
    add constraint activity_logs_event_type_check check (event_type in (
      'login',
      'logout',
      'session_expired',
      'profile_update',
      'purchase',
      'upload_attempt',
      'verification_submitted'
    ));

  create or replace function public.expire_stale_sessions(p_timeout_seconds integer default 180)
  returns setof public.user_sessions
  language sql
  security definer
  set search_path = public
  as $$
    update public.user_sessions
    set is_active = false,
        logout_at = last_seen_at,
        duration_seconds = greatest(0, extract(epoch from (last_seen_at - login_at))::integer)
    where is_active = true
      and last_seen_at < now() - make_interval(secs => p_timeout_seconds)
    returning *;
  $$;

  revoke all on function public.expire_stale_sessions(integer) from public;
  grant execute on function public.expire_stale_sessions(integer) to service_role;
