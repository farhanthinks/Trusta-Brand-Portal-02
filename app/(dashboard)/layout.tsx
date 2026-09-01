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

export default async function DashboardLayout({
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
    <>
      <SessionHeartbeat />
      <DashboardShell brand={brand} email={profile?.email ?? null} entitlements={entitlements}>
        {children}
      </DashboardShell>
    </>
  );
}
