import { Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDuration } from "@/lib/format";
import type { UserSessionSummaryRow } from "@/lib/admin/queries";

function initialsFor(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function shortId(userId: string) {
  return userId.slice(0, 8).toUpperCase();
}

export function SessionSummaryTable({ rows }: { rows: UserSessionSummaryRow[] }) {
  const top = rows.slice(0, 10);
  const maxWeekSeconds = Math.max(1, ...top.map((r) => r.totalThisWeekSeconds));

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Clock className="size-4 text-primary" />
        <div>
          <h2 className="text-sm font-semibold leading-tight">Time on platform</h2>
          <p className="text-xs leading-tight text-muted-foreground">
            Top {top.length} most active users, last 7 days
          </p>
        </div>
      </div>

      {top.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No session activity in the last 7 days.
        </p>
      ) : (
        <ul className="divide-y">
          {top.map((row, i) => (
            <li key={row.user_id} className="flex min-h-14 items-center gap-3 px-4 py-2">
              <span className="w-4 shrink-0 text-center text-xs font-medium text-muted-foreground">
                {i + 1}
              </span>
              <Avatar className="size-8 shrink-0 border">
                {row.logo_url && <AvatarImage src={row.logo_url} alt={row.business_name ?? ""} />}
                <AvatarFallback className="bg-red-50 text-xs font-semibold text-primary">
                  {initialsFor(row.business_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">
                  {row.business_name ?? row.email ?? "Unknown user"}
                </p>
                <p className="truncate text-xs leading-tight text-muted-foreground">
                  {row.email ?? shortId(row.user_id)}
                </p>
              </div>
              <div className="hidden w-24 shrink-0 text-right sm:block">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-sm font-medium leading-tight">
                  {formatDuration(row.totalTodaySeconds)}
                </p>
              </div>
              <div className="w-32 shrink-0 text-right">
                <p className="text-xs text-muted-foreground">This week</p>
                <p className="text-sm font-semibold leading-tight text-primary">
                  {formatDuration(row.totalThisWeekSeconds)}
                </p>
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-red-50">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(row.totalThisWeekSeconds / maxWeekSeconds) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
