-- ============================================================================
-- Trusta Brand Portal — Brand User Portal Settings.
--
-- 1. profiles gains personal account fields (full_name, phone), a
--    notification-preferences flag set, and deactivated_at — all written
--    exclusively via service-role server actions (app/(dashboard)/dashboard
--    /settings/actions.ts) that verify auth.uid() themselves before writing,
--    the same pattern already used for admin writes (setSuspended,
--    setAdminRole, deleteBrandUser). No new RLS UPDATE policy or column
--    grant is added on profiles — the existing "profiles: read own" SELECT
--    policy is all a brand needs, since it never writes its own row
--    directly.
-- 2. user_sessions gains an owner-read policy so a brand can see its own
--    Active Sessions list (previously admin-only), mirroring the
--    "activity_logs: owner read" policy added earlier.
-- ============================================================================

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists deactivated_at timestamptz,
  add column if not exists notification_preferences jsonb not null default '{
    "email_notifications": true,
    "account_alerts": true,
    "payment_alerts": true
  }'::jsonb;

create policy "user_sessions: owner read"
  on public.user_sessions for select
  using (user_id = auth.uid());
