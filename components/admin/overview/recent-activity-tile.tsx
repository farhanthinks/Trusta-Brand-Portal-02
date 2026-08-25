import { Rss } from "lucide-react";
import { getRecentActivity } from "@/lib/admin/queries";
import { EVENT_META, displayNameFor } from "@/components/admin/activity-event-meta";
import { BentoTile, BentoTileHeader } from "./bento-tile";
import { timeAgo } from "@/lib/format";

export async function RecentActivityTile({ className }: { className?: string }) {
  const activity = await getRecentActivity(8);

  return (
    <BentoTile className={className} href="/admin/logs">
      <BentoTileHeader title="Recent activity" icon={Rss} />
      {activity.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
      ) : (
        <ul className="max-h-56 space-y-3 overflow-y-auto pr-1">
          {activity.map((row) => {
            const meta = EVENT_META[row.event_type];
            const Icon = meta.icon;
            return (
              <li key={row.id} className="flex items-start gap-3 text-sm">
                <Icon className={`mt-0.5 size-4 shrink-0 ${meta.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate">
                    <span className="font-medium">
                      {displayNameFor(row.business_name, row.email)}
                    </span>{" "}
                    <span className="text-muted-foreground">{meta.label.toLowerCase()}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{timeAgo(row.created_at)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </BentoTile>
  );
}
