"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import {
  CATEGORY_LABEL,
  CATEGORY_STYLES,
  EVENT_META,
  getEventLabel,
} from "@/components/admin/activity-event-meta";
import { formatDateTime, maskIp } from "@/lib/format";
import type { BrandActivityLogRow } from "@/lib/admin/queries";

// user_agent is technical detail for the event drawer, not the compact list.
const SUMMARY_EXCLUDED_KEYS = new Set(["user_agent"]);

function summarizeMetadata(metadata: Record<string, unknown>): string {
  const entries = Object.entries(metadata).filter(
    ([k, v]) => v !== undefined && v !== null && v !== "" && !SUMMARY_EXCLUDED_KEYS.has(k)
  );
  if (entries.length === 0) return "—";
  return entries.map(([k, v]) => `${k}: ${v}`).join(", ");
}

export function ActivityEventRow({
  row,
  userEmail,
  isLast,
  onClick,
}: {
  row: BrandActivityLogRow;
  userEmail: string | null;
  isLast: boolean;
  onClick: () => void;
}) {
  const meta = EVENT_META[row.event_type];
  const Icon = meta.icon;

  return (
    <TableRow className="cursor-pointer transition-colors hover:bg-red-50/40" onClick={onClick}>
      <TableCell className="relative w-6 p-0">
        <div className={`absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 bg-border`} />
        {!isLast && <div className="absolute left-1/2 top-1/2 h-1/2 w-px -translate-x-1/2 bg-border" />}
        <span className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-white" />
      </TableCell>

      <TableCell className="whitespace-nowrap text-sm">{formatDateTime(row.created_at)}</TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <Icon className={`size-4 shrink-0 ${meta.color}`} />
          <div>
            <p className="text-sm">{getEventLabel(row.event_type, row.metadata)}</p>
            <span
              className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_STYLES[meta.category]}`}
            >
              {CATEGORY_LABEL[meta.category]}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
        {summarizeMetadata(row.metadata)}
      </TableCell>

      <TableCell className="max-w-[10rem] truncate text-sm text-muted-foreground">
        {userEmail ?? "—"}
      </TableCell>

      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
        {maskIp(row.ip_address)}
      </TableCell>
    </TableRow>
  );
}
