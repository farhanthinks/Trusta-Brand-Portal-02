import { redirect } from "next/navigation";
import { getCurrentBrand, getCurrentProfile, getCurrentUser } from "@/lib/supabase/queries";
import { DashboardShell } from "@/components/dashboard/shell";
import { SessionHeartbeat } from "@/components/session-heartbeat";
import { logout } from "@/app/(auth)/actions";

export default async function PurchaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentProfile();
  if (profile?.is_suspended) await logout();

  const brand = await getCurrentBrand();
  if (!brand || brand.status !== "approved") {
    redirect("/onboarding");
  }

  return (
    <DashboardShell brand={brand}>
      <SessionHeartbeat />
      {/* TEMPORARY: Razorpay checkout.js disabled while DummyPaymentButtons
          (components/purchase/dummy-payment-buttons.tsx) stands in for real
          checkout. Restore this <Script> when CheckoutButton is reinstated. */}
      {children}
    </DashboardShell>
  );
}
