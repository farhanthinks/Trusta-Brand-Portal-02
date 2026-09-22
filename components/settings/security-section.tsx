import { ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChangePasswordDialog } from "./change-password-dialog";
import { LogoutAllDevicesDialog } from "./logout-all-devices-dialog";
import { ActiveSessionsList } from "./active-sessions-list";
import type { UserSession } from "@/lib/supabase/types";

export function SecuritySection({
  sessions,
  currentSessionId,
}: {
  sessions: UserSession[];
  currentSessionId: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          Security
        </CardTitle>
        <CardDescription>Password, sessions, and device access.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Password</p>
            <p className="text-sm text-muted-foreground">Change your account password.</p>
          </div>
          <ChangePasswordDialog />
        </div>

        <Separator />

        <div>
          <p className="mb-3 text-sm font-medium">Active sessions</p>
          <ActiveSessionsList sessions={sessions} currentSessionId={currentSessionId} />
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Log out everywhere</p>
            <p className="text-sm text-muted-foreground">
              End every active session on every device.
            </p>
          </div>
          <LogoutAllDevicesDialog />
        </div>
      </CardContent>
    </Card>
  );
}
