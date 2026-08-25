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
 * Logs out without waiting on a full server round-trip: clears the local
 * session immediately (`scope: "local"` skips the network call to revoke
 * the session on Supabase's side) and navigates right away. Server-side
 * bookkeeping (activity log, session close-out) fires in the background via
 * `keepalive` so it survives the navigation without blocking the click.
 */
export function LogoutButton({ className, variant = "ghost", size = "sm", children }: LogoutButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleLogout() {
    startTransition(async () => {
      fetch("/api/auth/logout", { method: "POST", keepalive: true }).catch(() => {});

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
