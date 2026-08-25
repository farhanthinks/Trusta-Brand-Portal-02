-- ============================================================================
-- Trusta Brand Portal — Module 1: Profiles, Brand onboarding, Verification,
-- Admin approval.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- updated_at helper trigger, reused by every table below.
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles — one row per auth user. Carries the is_admin flag used by RLS.
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- security definer helper so RLS policies can check admin status without
-- recursively hitting profiles' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: admins read all"
  on public.profiles for select
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- brands
-- ----------------------------------------------------------------------------
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  business_name text,
  business_type text,
  gstin text,
  address text,
  city text,
  state text,
  pincode text,
  contact_number text,
  logo_url text,
  status text not null default 'registered'
    check (status in (
      'registered',
      'profile_completed',
      'verification_pending',
      'verified',
      'approved',
      'rejected'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger brands_set_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

alter table public.brands enable row level security;

create policy "brands: owner read"
  on public.brands for select
  using (user_id = auth.uid());

create policy "brands: owner insert"
  on public.brands for insert
  with check (user_id = auth.uid());

create policy "brands: owner update while not yet under review"
  on public.brands for update
  using (user_id = auth.uid() and status in ('registered', 'profile_completed'))
  with check (user_id = auth.uid());

create policy "brands: admin read all"
  on public.brands for select
  using (public.is_admin());

create policy "brands: admin update all"
  on public.brands for update
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- brand_verifications — document upload + admin review (pending/verified/rejected)
-- ----------------------------------------------------------------------------
create table public.brand_verifications (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  document_url text not null,
  document_type text not null default 'business_proof'
    check (document_type in ('business_proof', 'id_proof')),
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected')),
  remarks text,
  verified_by uuid references auth.users (id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.brand_verifications enable row level security;

create policy "brand_verifications: owner read"
  on public.brand_verifications for select
  using (exists (
    select 1 from public.brands b
    where b.id = brand_verifications.brand_id and b.user_id = auth.uid()
  ));

create policy "brand_verifications: owner insert"
  on public.brand_verifications for insert
  with check (exists (
    select 1 from public.brands b
    where b.id = brand_verifications.brand_id and b.user_id = auth.uid()
  ));

create policy "brand_verifications: admin read all"
  on public.brand_verifications for select
  using (public.is_admin());

create policy "brand_verifications: admin update all"
  on public.brand_verifications for update
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- brand_approvals — admin business decision, separate from document review.
-- One audit row per approve/reject decision; approved_by/approved_at/remarks
-- live here rather than on brands, which only tracks current status.
-- ----------------------------------------------------------------------------
create table public.brand_approvals (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  status text not null check (status in ('approved', 'rejected')),
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  remarks text,
  created_at timestamptz not null default now()
);

alter table public.brand_approvals enable row level security;

create policy "brand_approvals: owner read"
  on public.brand_approvals for select
  using (exists (
    select 1 from public.brands b
    where b.id = brand_approvals.brand_id and b.user_id = auth.uid()
  ));

create policy "brand_approvals: admin read all"
  on public.brand_approvals for select
  using (public.is_admin());

create policy "brand_approvals: admin insert"
  on public.brand_approvals for insert
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- Storage buckets
--   brand-logos     — public read (shown in dashboard header), owner write
--   brand-documents — private, owner + admin only
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('brand-logos', 'brand-logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('brand-documents', 'brand-documents', false)
on conflict (id) do nothing;

-- Objects are stored under "<user_id>/<filename>" so ownership can be
-- checked from the path's first folder segment.
create policy "brand-logos: public read"
  on storage.objects for select
  using (bucket_id = 'brand-logos');

create policy "brand-logos: owner write"
  on storage.objects for insert
  with check (bucket_id = 'brand-logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "brand-logos: owner update"
  on storage.objects for update
  using (bucket_id = 'brand-logos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "brand-documents: owner read"
  on storage.objects for select
  using (bucket_id = 'brand-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "brand-documents: owner write"
  on storage.objects for insert
  with check (bucket_id = 'brand-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "brand-documents: admin read"
  on storage.objects for select
  using (bucket_id = 'brand-documents' and public.is_admin());
