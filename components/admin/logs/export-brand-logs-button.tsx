"use client";

import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { getEventLabel } from "@/components/admin/activity-event-meta";
import { formatDateTime, maskIp } from "@/lib/format";
import { exportBrandActivityLogs } from "@/app/(admin)/admin/logs/actions";
import type { BrandActivityLogRow, BrandActivityLogsFilters } from "@/lib/admin/queries";

export function ExportBrandLogsButton({
  filters,
  userEmail,
  filenamePrefix,
}: {
  filters: Omit<BrandActivityLogsFilters, "page" | "pageSize">;
  userEmail: string | null;
  filenamePrefix: string;
}) {
  return (
    <ExportCsvButton
      fetchRows={exportBrandActivityLogs.bind(null, filters)}
      filenamePrefix={filenamePrefix}
      toRow={(row: BrandActivityLogRow) => ({
        timestamp: formatDateTime(row.created_at),
        event: getEventLabel(row.event_type, row.metadata),
        user: userEmail,
        ip_address: maskIp(row.ip_address),
        details: JSON.stringify(row.metadata),
      })}
    />
  );
}
