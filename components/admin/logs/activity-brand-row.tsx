"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CATEGORY_LABEL,
  CATEGORY_STYLES,
  EVENT_META,
  getEventLabel,
} from "@/components/admin/activity-event-meta";
import { formatDateTime } from "@/lib/format";
import type { BrandActivitySummaryRow } from "@/lib/supabase/types";

function initialsFor(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function ActivityBrandRow({ row }: { row: BrandActivitySummaryRow }) {
  const router = useRouter();
  const meta = row.last_event_type ? EVENT_META[row.last_event_type] : null;
  const Icon = meta?.icon;

  return (
    <TableRow
      className="cursor-pointer transition-colors hover:bg-red-50/40"
      onClick={() => router.push(`/admin/logs/${row.brand_id}`)}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0 border">
            {row.logo_url && <AvatarImage src={row.logo_url} alt={row.business_name ?? ""} />}
            <AvatarFallback className="bg-red-50 text-xs font-semibold text-primary">
              {initialsFor(row.business_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.business_name ?? "Unnamed business"}</p>
            <p className="truncate text-xs text-muted-foreground">{row.email ?? "—"}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        {row.last_event_at ? (
          <div>
            <p className="text-sm">{formatDateTime(row.last_event_at)}</p>
            <p className="text-xs text-muted-foreground">by {row.email ?? "—"}</p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No activity yet</span>
        )}
      </TableCell>

      <TableCell>
        {row.last_event_type && meta && Icon ? (
          <div className="flex items-center gap-2">
            <Icon className={`size-4 shrink-0 ${meta.color}`} />
            <div>
              <p className="text-sm">{getEventLabel(row.last_event_type, {})}</p>
              <span
                className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_STYLES[meta.category]}`}
              >
                {CATEGORY_LABEL[meta.category]}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell>
        <motion.span
          key={row.events_today}
          initial={{ scale: 0.85, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className={
            row.events_today > 0
              ? "inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground"
              : "text-sm text-muted-foreground"
          }
        >
          {row.events_today}
        </motion.span>
      </TableCell>

      <TableCell className="text-sm text-muted-foreground">{row.total_events}</TableCell>

      <TableCell>
        <ChevronRight className="size-4 text-muted-foreground" />
      </TableCell>
    </TableRow>
  );
}
