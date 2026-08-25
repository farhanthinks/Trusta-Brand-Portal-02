-- ============================================================================
-- Trusta Brand Portal — Module 2: Catalog, Orders, Entitlements.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- catalog_items — QR / dynamic QR / subscription / other offerings.
-- ----------------------------------------------------------------------------
create table public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('qr', 'dynamic_qr', 'subscription', 'other')),
  name text not null,
  description text,
  -- QR/dynamic_qr: [{ "label": "100", "quantity": 100, "price": 499 }, ...]
  -- subscription:  [{ "label": "Pro (monthly)", "quantity": 1, "price": 2999 }, ...]
  tier_options jsonb,
  -- flat price for 'other' items with no tiers.
  price numeric(10, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.catalog_items enable row level security;

create policy "catalog_items: anyone authenticated can read active items"
  on public.catalog_items for select
  using (is_active = true or public.is_admin());

create policy "catalog_items: admin write"
  on public.catalog_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- orders
-- Brands may INSERT their own order (created server-side as 'pending' before
-- redirecting to Razorpay checkout). There is deliberately no UPDATE policy
-- for the authenticated role — moving an order to 'success'/'failed' is only
-- ever done by the service-role client from the payment verification /
-- webhook route handlers, which bypass RLS.
-- ----------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  catalog_item_id uuid references public.catalog_items (id),
  item_type text not null check (item_type in ('qr', 'dynamic_qr', 'subscription', 'other')),
  item_details jsonb not null default '{}'::jsonb,
  quantity integer not null default 1,
  amount numeric(10, 2) not null,
  currency text not null default 'INR',
  payment_provider text not null default 'razorpay',
  payment_id text,
  razorpay_order_id text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'success', 'failed')),
  created_at timestamptz not null default now()
);

create index orders_brand_id_idx on public.orders (brand_id);
create index orders_razorpay_order_id_idx on public.orders (razorpay_order_id);

alter table public.orders enable row level security;

create policy "orders: owner read"
  on public.orders for select
  using (exists (
    select 1 from public.brands b
    where b.id = orders.brand_id and b.user_id = auth.uid()
  ));

create policy "orders: owner insert pending order"
  on public.orders for insert
  with check (
    payment_status = 'pending'
    and exists (
      select 1 from public.brands b
      where b.id = orders.brand_id and b.user_id = auth.uid() and b.status = 'approved'
    )
  );

create policy "orders: admin read all"
  on public.orders for select
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- brand_entitlements
-- Read-only to the owning brand. Writes only via service role (webhook /
-- payment verification route), which upserts quotas after a successful order.
-- ----------------------------------------------------------------------------
create table public.brand_entitlements (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null unique references public.brands (id) on delete cascade,
  qr_quota integer not null default 0,
  dynamic_qr_quota integer not null default 0,
  subscription_plan text,
  subscription_expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create trigger brand_entitlements_set_updated_at
  before update on public.brand_entitlements
  for each row execute function public.set_updated_at();

alter table public.brand_entitlements enable row level security;

create policy "brand_entitlements: owner read"
  on public.brand_entitlements for select
  using (exists (
    select 1 from public.brands b
    where b.id = brand_entitlements.brand_id and b.user_id = auth.uid()
  ));

create policy "brand_entitlements: admin read all"
  on public.brand_entitlements for select
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- Seed catalog data
-- ----------------------------------------------------------------------------
insert into public.catalog_items (type, name, description, tier_options, price, is_active) values
(
  'qr',
  'Static QR Codes',
  'Fixed-content QR codes for packaging, print and point-of-sale.',
  '[
    {"label": "100 codes", "quantity": 100, "price": 499},
    {"label": "500 codes", "quantity": 500, "price": 1999},
    {"label": "1000 codes", "quantity": 1000, "price": 3499},
    {"label": "5000 codes", "quantity": 5000, "price": 14999}
  ]'::jsonb,
  null,
  true
),
(
  'dynamic_qr',
  'Dynamic QR Codes',
  'Editable QR codes whose destination can be updated after printing, with scan analytics.',
  '[
    {"label": "100 codes", "quantity": 100, "price": 899},
    {"label": "500 codes", "quantity": 500, "price": 3499},
    {"label": "1000 codes", "quantity": 1000, "price": 5999},
    {"label": "5000 codes", "quantity": 5000, "price": 24999}
  ]'::jsonb,
  null,
  true
),
(
  'subscription',
  'Subscription Plans',
  'Monthly or yearly plans bundling QR credits with platform features.',
  '[
    {"label": "Basic (monthly)", "quantity": 1, "price": 999},
    {"label": "Pro (monthly)", "quantity": 1, "price": 2999},
    {"label": "Enterprise (monthly)", "quantity": 1, "price": 7999},
    {"label": "Basic (yearly)", "quantity": 1, "price": 9999},
    {"label": "Pro (yearly)", "quantity": 1, "price": 29999},
    {"label": "Enterprise (yearly)", "quantity": 1, "price": 79999}
  ]'::jsonb,
  null,
  true
),
(
  'other',
  'Custom Packaging Design',
  'One-off design service for QR-integrated packaging artwork.',
  null,
  4999,
  true
),
(
  'other',
  'Priority Onboarding Support',
  'Dedicated support to get your catalog and QR rollout live faster.',
  null,
  1999,
  true
);
