# Trusta — Brand Portal

Multi-tenant brand onboarding + QR/subscription purchase portal.

- **Module 1** — Registration → Profile → Verification → Admin Approval → Dashboard access.
- **Module 2** — Catalog browsing, checkout via Razorpay (test mode), entitlement tracking.
- **Admin Module** — Sidebar-driven admin dashboard: bento-grid Overview, User Management (search/filter/suspend/promote), unified Approval History, Activity Logs, and Active Sessions/time-tracking.

## Stack

Next.js 14 (App Router) · TypeScript · Supabase (Auth, Postgres, Storage, RLS) · Tailwind CSS v4 · shadcn/ui · Framer Motion · Razorpay.

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migrations in order:
   - `supabase/migrations/20260821000001_profiles_and_brands.sql`
   - `supabase/migrations/20260821000002_catalog_and_orders.sql`
   - `supabase/migrations/20260824000001_admin_activity_and_sessions.sql`

   (Or, if you use the Supabase CLI: `supabase link` then `supabase db push`.)
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — from Project Settings → API.

## 2. Seed the admin account

The internal admin route (`/admin/brands`) is gated by an `is_admin` flag on `public.profiles`. After running the migrations and setting `.env.local`, create the admin login:

```bash
npm run seed:admin
```

This creates (or reuses) the account `admin@trusta.com` / `admin@123` and flags it `is_admin = true`. Override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars if you want different credentials — **change the password before using this anywhere but local development.**

## 3. Set up Razorpay (test mode)

1. Get your **Test Mode** API keys from Dashboard → Settings → API Keys.
2. Add `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env.local`.
3. Create a webhook (Dashboard → Settings → Webhooks) pointing at `<your-app-url>/api/razorpay/webhook`, subscribed to `payment.captured` and `payment.failed`. Copy the webhook secret into `RAZORPAY_WEBHOOK_SECRET`.
   - In local dev, use a tunnel (e.g. `ngrok http 3000`) so Razorpay can reach the webhook.
4. Use [Razorpay's test cards](https://razorpay.com/docs/payments/payments/test-card-details/) to simulate successful/failed payments.

Payment integration lives behind `lib/payments/` (`PaymentProvider` interface, `getPaymentProvider()`), so swapping gateways later means implementing the interface and changing one import.

## 4. Run the app

```bash
npm install
npm run dev
```

Visit `/sign-up` to start onboarding as a brand, or `/login` with the seeded admin account to land on the admin dashboard at `/admin`.

`npm run dev` uses Turbopack (`next dev --turbo`) for faster cold-compiles.

## Notes

- All writes to `brands.status`, `payment_status`, `brand_entitlements`, `activity_logs`, and `user_sessions` go through Server Actions / Route Handlers — never directly from the client.
- `brand-logos` is a public Storage bucket; `brand-documents` is private (owner + admin only, served via short-lived signed URLs).
- The Razorpay webhook is the source of truth for payment state; the client-side `/api/razorpay/verify` call is a fast-path confirmation. Both converge on the same idempotent `fulfillOrder()` helper.
- Login/logout and key onboarding/purchase events are recorded to `activity_logs`; sessions are tracked in `user_sessions` via a client heartbeat, powering the admin Active Sessions view.
