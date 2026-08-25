import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPagination } from "@/components/admin/pagination";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { EVENT_META, displayNameFor } from "@/components/admin/activity-event-meta";
import { formatDateTime } from "@/lib/format";
import { exportActivityLogs } from "@/app/(admin)/admin/logs/actions";
import type { ActivityLogsFilters, RecentActivityRow } from "@/lib/admin/queries";

export function LogsTable({
  rows,
  page,
  pageSize,
  total,
  searchParams,
  exportFilters,
}: {
  rows: RecentActivityRow[];
  page: number;
  pageSize: number;
  total: number;
  searchParams: Record<string, string | undefined>;
  exportFilters: Omit<ActivityLogsFilters, "page" | "pageSize">;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm text-muted-foreground">{total} events</span>
        <ExportCsvButton
          fetchRows={() => exportActivityLogs(exportFilters)}
          filenamePrefix="trusta-activity-logs"
          toRow={(row: RecentActivityRow) => ({
            user: displayNameFor(row.business_name, row.email),
            event_type: row.event_type,
            metadata: JSON.stringify(row.metadata),
            timestamp: row.created_at,
          })}
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No events match these filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const meta = EVENT_META[row.event_type];
                const Icon = meta.icon;
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {displayNameFor(row.business_name, row.email)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 text-sm ${meta.color}`}>
                        <Icon className="size-4" />
                        {meta.label}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                      {Object.keys(row.metadata).length > 0 ? JSON.stringify(row.metadata) : "—"}
                    </TableCell>
                    <TableCell>{formatDateTime(row.created_at)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/admin/logs"
        searchParams={searchParams}
      />
    </div>
  );
}
