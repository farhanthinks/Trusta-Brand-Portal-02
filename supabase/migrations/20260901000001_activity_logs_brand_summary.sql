-- ============================================================================
-- Trusta Brand Portal — Activity Logs redesign support.
--
-- 1. activity_logs.brand_id: previously the brand relationship only existed
--    indirectly (user_id -> brands.user_id), resolved via a JS-side lookup
--    on every read. That's fine for a handful of rows but can't support an
--    efficient "one row per brand, grouped/aggregated" summary query. Adding
--    a real FK column, populated at write time going forward and backfilled
--    for existing rows here.
-- 2. activity_logs.ip_address: captured at write time from the request
--    headers (see lib/admin/activity.ts) so the admin activity detail view
--    can show a real (masked) IP instead of inventing one.
-- 3. get_brand_activity_summary(): the Page 1 "Activity Logs" brand list
--    needs, per brand, its latest event + an events-today count + a total
--    count. PostgREST has no GROUP BY support, and pulling every log row to
--    aggregate in JS doesn't scale — so this does it in one indexed query
--    server-side, with search/filter/pagination built in and a window-
--    function total_count for pagination. SECURITY DEFINER (it reads across
--    every brand regardless of RLS), so it re-checks is_admin() itself —
--    without that check, security definer would hand any authenticated
--    caller everyone's activity data.
-- ============================================================================

alter table public.activity_logs
  add column if not exists brand_id uuid references public.brands (id) on delete cascade,
  add column if not exists ip_address text;

update public.activity_logs al
set brand_id = b.id
from public.brands b
where b.user_id = al.user_id
  and al.brand_id is null;

create index if not exists activity_logs_brand_id_idx on public.activity_logs (brand_id);

create or replace function public.get_brand_activity_summary(
  p_search text default null,
  p_user_id uuid default null,
  p_event_type text default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null,
  p_today_start timestamptz default null,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  brand_id uuid,
  business_name text,
  email text,
  logo_url text,
  status text,
  last_event_type text,
  last_event_at timestamptz,
  events_today bigint,
  total_events bigint,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  with matching_brands as (
    select b.id
    from public.brands b
    join public.profiles p on p.id = b.user_id
    where
      (p_search is null or p_search = '' or b.business_name ilike '%' || p_search || '%' or p.email ilike '%' || p_search || '%')
      and (p_user_id is null or b.user_id = p_user_id)
      and (
        (p_event_type is null and p_date_from is null and p_date_to is null)
        or exists (
          select 1 from public.activity_logs al
          where al.brand_id = b.id
            and (p_event_type is null or al.event_type = p_event_type)
            and (p_date_from is null or al.created_at >= p_date_from)
            and (p_date_to is null or al.created_at <= p_date_to)
        )
      )
  )
  select
    b.id,
    b.business_name,
    p.email,
    b.logo_url,
    b.status,
    last_log.event_type,
    last_log.created_at,
    coalesce(today_count.cnt, 0),
    coalesce(total_count.cnt, 0),
    count(*) over ()
  from matching_brands mb
  join public.brands b on b.id = mb.id
  join public.profiles p on p.id = b.user_id
  left join lateral (
    select al.event_type, al.created_at
    from public.activity_logs al
    where al.brand_id = b.id
    order by al.created_at desc
    limit 1
  ) last_log on true
  left join lateral (
    select count(*) as cnt
    from public.activity_logs al2
    where al2.brand_id = b.id
      and al2.created_at >= coalesce(p_today_start, date_trunc('day', now()))
  ) today_count on true
  left join lateral (
    select count(*) as cnt
    from public.activity_logs al3
    where al3.brand_id = b.id
  ) total_count on true
  order by last_log.created_at desc nulls last, b.created_at desc
  limit p_limit offset p_offset;
end;
$$;
