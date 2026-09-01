-- ============================================================================
-- Trusta Brand Portal — let a brand read its own activity_logs.
--
-- activity_logs previously had only an admin-read policy (see the original
-- migration). The brand dashboard's "Recent Activity" section needs a brand
-- to see its own events — read-only, own rows only, via the same
-- brand_id -> brands.user_id = auth.uid() check used everywhere else.
-- ============================================================================

create policy "activity_logs: owner read"
  on public.activity_logs for select
  using (exists (
    select 1 from public.brands b
    where b.id = activity_logs.brand_id and b.user_id = auth.uid()
  ));
