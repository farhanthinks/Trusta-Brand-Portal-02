"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

interface LogoutButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Awaits the server-side logout bookkeeping (activity log, session
 * close-out) BEFORE clearing the local Supabase session, so that work is
 * guaranteed to land before this browser's auth cookies disappear — not
 * fire-and-forget, since an unawaited call has no guarantee of completing
 * once navigation starts. `keepalive: true` stays on as defense in depth.
 * `scope: "local"` on signOut skips the network call to revoke the session
 * on Supabase's side, since server-side sign-out already happened above.
 */
export function LogoutButton({ className, variant = "ghost", size = "sm", children }: LogoutButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleLogout() {
    startTransition(async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST", keepalive: true });
      } catch {
        // Best-effort — still proceed with the client-side sign-out below.
      }

      const supabase = createClient();
      await supabase.auth.signOut({ scope: "local" });

      router.push("/login");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={pending}
      className={cn("gap-2", className)}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      {children ?? "Log out"}
    </Button>
  );
}
