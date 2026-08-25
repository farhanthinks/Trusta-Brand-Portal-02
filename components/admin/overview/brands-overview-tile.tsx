import { Building2 } from "lucide-react";
import { getBrandsBreakdown } from "@/lib/admin/queries";
import { BentoTile, BentoTileHeader } from "./bento-tile";
import { BrandsDonutChart } from "./brands-donut-chart";

export async function BrandsOverviewTile({ className }: { className?: string }) {
  const { total, approved, pending, rejected } = await getBrandsBreakdown();

  return (
    <BentoTile className={className} href="/admin/users">
      <BentoTileHeader title="Brands overview" icon={Building2} />
      <div className="flex items-center gap-4">
        <BrandsDonutChart approved={approved} pending={pending} rejected={rejected} />
        <div className="space-y-1.5 text-sm">
          <Legend color="#16a34a" label="Approved" value={approved} />
          <Legend color="#DC2626" label="Pending" value={pending} />
          <Legend color="#94a3b8" label="Rejected" value={rejected} />
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{total} total brands</p>
    </BentoTile>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
