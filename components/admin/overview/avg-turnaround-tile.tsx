import { Timer } from "lucide-react";
import { getAvgApprovalTurnaroundHours } from "@/lib/admin/queries";
import { BentoTile, BentoTileHeader } from "./bento-tile";

export async function AvgTurnaroundTile({ className }: { className?: string }) {
  const hours = await getAvgApprovalTurnaroundHours();

  return (
    <BentoTile className={className}>
      <BentoTileHeader title="Avg. approval turnaround" icon={Timer} />
      {hours === null ? (
        <>
          <span className="text-3xl font-bold tracking-tight text-muted-foreground">—</span>
          <p className="mt-1 text-sm text-muted-foreground">no approvals yet</p>
        </>
      ) : hours < 24 ? (
        <>
          <span className="text-3xl font-bold tracking-tight">{hours.toFixed(1)}h</span>
          <p className="mt-1 text-sm text-muted-foreground">registration &rarr; approval</p>
        </>
      ) : (
        <>
          <span className="text-3xl font-bold tracking-tight">{(hours / 24).toFixed(1)}d</span>
          <p className="mt-1 text-sm text-muted-foreground">registration &rarr; approval</p>
        </>
      )}
    </BentoTile>
  );
}
