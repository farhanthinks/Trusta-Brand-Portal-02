import { UserPlus } from "lucide-react";
import { getNewRegistrations } from "@/lib/admin/queries";
import { BentoTile, BentoTileHeader } from "./bento-tile";
import { SparklineChart } from "./sparkline-chart";

export async function NewRegistrationsTile({ className }: { className?: string }) {
  const { today, thisWeek, sparkline } = await getNewRegistrations();

  return (
    <BentoTile className={className}>
      <BentoTileHeader title="New registrations" icon={UserPlus} />
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight">{today}</span>
        <span className="text-sm text-muted-foreground">today</span>
      </div>
      <p className="text-sm text-muted-foreground">{thisWeek} this week</p>
      <div className="mt-auto pt-3">
        <SparklineChart data={sparkline} />
      </div>
    </BentoTile>
  );
}
