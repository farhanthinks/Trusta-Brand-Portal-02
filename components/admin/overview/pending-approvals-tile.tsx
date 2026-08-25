import { ClipboardCheck } from "lucide-react";
import { getPendingApprovalsCount } from "@/lib/admin/queries";
import { Badge } from "@/components/ui/badge";
import { BentoTile, BentoTileHeader } from "./bento-tile";

export async function PendingApprovalsTile({ className }: { className?: string }) {
  const count = await getPendingApprovalsCount();

  return (
    <BentoTile className={className} href="/admin/brands">
      <BentoTileHeader title="Pending approvals" icon={ClipboardCheck} />
      <div className="flex items-center gap-2">
        <span className="text-4xl font-bold tracking-tight">{count}</span>
        {count > 0 && (
          <Badge className="bg-primary text-primary-foreground">needs review</Badge>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">brands awaiting review</p>
      <span className="mt-auto pt-6 text-sm font-medium text-primary group-hover:underline">
        Go to approval queue &rarr;
      </span>
    </BentoTile>
  );
}
