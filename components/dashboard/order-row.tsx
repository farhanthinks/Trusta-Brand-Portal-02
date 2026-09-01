import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { Order } from "@/lib/supabase/types";

const ITEM_TYPE_LABEL: Record<string, string> = {
  qr: "Static QR",
  dynamic_qr: "Dynamic QR",
  subscription: "Subscription",
  other: "Other",
};

const STATUS_STYLES: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

export function OrderRow({ order }: { order: Order }) {
  const itemLabel = order.item_details?.tier_label
    ? `${ITEM_TYPE_LABEL[order.item_type] ?? order.item_type} — ${order.item_details.tier_label}`
    : ITEM_TYPE_LABEL[order.item_type] ?? order.item_type;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{itemLabel}</p>
        <p className="text-xs text-muted-foreground">
          #{order.id.slice(0, 8)} · {formatDateTime(order.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-medium">₹{Number(order.amount).toLocaleString("en-IN")}</span>
        <Badge className={STATUS_STYLES[order.payment_status] ?? "bg-secondary"}>
          {order.payment_status}
        </Badge>
      </div>
    </div>
  );
}
