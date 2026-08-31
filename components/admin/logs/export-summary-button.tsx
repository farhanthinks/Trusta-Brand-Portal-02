"use client";

import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { getEventLabel } from "@/components/admin/activity-event-meta";
import { formatDateTime } from "@/lib/format";
import { exportBrandActivitySummary } from "@/app/(admin)/admin/logs/actions";
import type { BrandActivitySummaryFilters } from "@/lib/admin/queries";
import type { BrandActivitySummaryRow } from "@/lib/supabase/types";

export function ExportSummaryButton({
  filters,
}: {
  filters: Omit<BrandActivitySummaryFilters, "page" | "pageSize">;
}) {
  return (
    <ExportCsvButton
      fetchRows={exportBrandActivitySummary.bind(null, filters)}
      filenamePrefix="trusta-brand-activity-summary"
      toRow={(row: BrandActivitySummaryRow) => ({
        brand: row.business_name,
        email: row.email,
        status: row.status,
        last_event: row.last_event_type ? getEventLabel(row.last_event_type, {}) : "—",
        last_activity: formatDateTime(row.last_event_at),
        events_today: row.events_today,
        total_events: row.total_events,
      })}
    />
  );
}
