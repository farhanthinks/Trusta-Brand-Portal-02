import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/queries";
import { logout } from "@/app/(auth)/actions";
import { LogoutButton } from "@/components/logout-button";
import { SessionHeartbeat } from "@/components/session-heartbeat";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentProfile();
  if (profile?.is_suspended) await logout();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50/60 via-white to-white">
      <SessionHeartbeat />
      <header className="flex items-center justify-between border-b bg-white/70 px-6 py-4 backdrop-blur-sm sm:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            T
          </span>
          <span className="font-semibold tracking-tight">Trusta</span>
        </Link>
        <LogoutButton />
      </header>
      <main className="px-4 py-12 sm:px-8">{children}</main>
    </div>
  );
}
