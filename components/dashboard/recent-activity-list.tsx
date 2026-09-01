import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentActivityForBrand } from "@/lib/dashboard/queries";
import { EVENT_META, getEventLabel } from "@/components/admin/activity-event-meta";
import { timeAgo } from "@/lib/format";

export async function RecentActivityList({ brandId }: { brandId: string }) {
  const activity = await getRecentActivityForBrand(brandId, 5);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="size-4 text-primary" />
          Recent Activity
        </CardTitle>
        {activity.length > 0 && (
          <Link
            href="/dashboard/activity"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {activity.map((log) => {
              const meta = EVENT_META[log.event_type];
              const Icon = meta.icon;
              return (
                <li key={log.id} className="flex items-start gap-2.5 text-sm">
                  <Icon className={`mt-0.5 size-4 shrink-0 ${meta.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{getEventLabel(log.event_type, log.metadata)}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(log.created_at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
