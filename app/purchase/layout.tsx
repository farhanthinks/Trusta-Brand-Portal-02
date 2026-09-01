import { redirect } from "next/navigation";
import {
  getCurrentBrand,
  getCurrentProfile,
  getCurrentUser,
  getBrandEntitlements,
} from "@/lib/supabase/queries";
import { DashboardShell } from "@/components/dashboard/shell";
import { SessionHeartbeat } from "@/components/session-heartbeat";
import { logout } from "@/app/(auth)/actions";

export default async function PurchaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, profile, brand] = await Promise.all([
    getCurrentUser(),
    getCurrentProfile(),
    getCurrentBrand(),
  ]);

  if (!user) redirect("/login");
  if (profile?.is_suspended) await logout();
  if (!brand || brand.status !== "approved") {
    redirect("/onboarding");
  }

  const entitlements = await getBrandEntitlements(brand.id);

  return (
    <DashboardShell brand={brand} email={profile?.email ?? null} entitlements={entitlements}>
      <SessionHeartbeat />
      {/* TEMPORARY: Razorpay checkout.js disabled while DummyPaymentButtons
          (components/purchase/dummy-payment-buttons.tsx) stands in for real
          checkout. Restore this <Script> when CheckoutButton is reinstated. */}
      {children}
    </DashboardShell>
  );
}
