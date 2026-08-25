import Script from "next/script";
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
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {children}
    </DashboardShell>
  );
}
