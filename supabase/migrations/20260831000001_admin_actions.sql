-- ============================================================================
-- Trusta Brand Portal — admin_actions audit log.
--
-- Deleting a brand/user account cascades through auth.users -> profiles,
-- brands -> brand_verifications/brand_approvals/orders/brand_entitlements,
-- and activity_logs/user_sessions (all already ON DELETE CASCADE). That
-- means logging the deletion to activity_logs with the deleted user's id
-- would be destroyed by the very cascade it's recording. admin_actions
-- exists to survive that: target_user_id is a plain column (no FK to a row
-- that's about to stop existing), with a snapshot of identifying info
-- captured before the delete happens.
-- ============================================================================

create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  action_type text not null check (action_type in ('user_deleted')),
  performed_by uuid references auth.users (id) on delete set null,
  target_user_id uuid,
  target_email text,
  target_business_name text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_actions_created_at_idx on public.admin_actions (created_at desc);

alter table public.admin_actions enable row level security;

create policy "admin_actions: admin read all"
  on public.admin_actions for select
  using (public.is_admin());
