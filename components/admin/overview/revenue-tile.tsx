import { IndianRupee } from "lucide-react";
import { getRevenueThisMonth } from "@/lib/admin/queries";
import { BentoTile, BentoTileHeader } from "./bento-tile";

export async function RevenueTile({ className }: { className?: string }) {
  const revenue = await getRevenueThisMonth();

  return (
    <BentoTile className={className}>
      <BentoTileHeader title="Revenue this month" icon={IndianRupee} />
      <span className="text-3xl font-bold tracking-tight">
        &#8377;{revenue.toLocaleString("en-IN")}
      </span>
      <p className="mt-1 text-sm text-muted-foreground">from successful payments</p>
    </BentoTile>
  );
}
