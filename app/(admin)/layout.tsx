import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/queries";
import { AdminShell } from "@/components/admin/admin-shell";
import { SessionHeartbeat } from "@/components/session-heartbeat";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentProfile();
  if (!profile?.is_admin) redirect("/");

  return (
    <>
      <SessionHeartbeat />
      <AdminShell adminEmail={profile.email ?? user.email ?? "Admin"}>
        {children}
      </AdminShell>
    </>
  );
}
