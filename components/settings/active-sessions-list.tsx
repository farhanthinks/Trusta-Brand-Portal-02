import { Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatDuration } from "@/lib/format";
import type { UserSession } from "@/lib/supabase/types";

export function ActiveSessionsList({
  sessions,
  currentSessionId,
}: {
  sessions: UserSession[];
  currentSessionId: string | null;
}) {
  if (sessions.length === 0) {
    return <p className="text-sm text-muted-foreground">No session history yet.</p>;
  }

  return (
    <ul className="divide-y rounded-lg border">
      {sessions.map((session) => {
        const isThisDevice = session.id === currentSessionId;
        return (
          <li key={session.id} className="flex items-center gap-3 px-3 py-2.5">
            <Monitor className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                {formatDateTime(session.login_at)}
                {isThisDevice && (
                  <Badge variant="outline" className="text-[10px]">
                    This device
                  </Badge>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {session.is_active
                  ? `Active · last seen ${formatDateTime(session.last_seen_at)}`
                  : session.logout_at
                  ? `Ended ${formatDateTime(session.logout_at)} · ${formatDuration(session.duration_seconds)}`
                  : "Ended"}
              </p>
            </div>
            {session.is_active && (
              <Badge className="shrink-0 gap-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Active
              </Badge>
            )}
          </li>
        );
      })}
    </ul>
  );
}
