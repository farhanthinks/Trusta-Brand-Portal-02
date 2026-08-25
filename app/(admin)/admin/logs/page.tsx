import { getActivityLogsList, getAllUsersForFilter } from "@/lib/admin/queries";
import { LogsFiltersBar } from "@/components/admin/logs/logs-filters-bar";
import { LogsTable } from "@/components/admin/logs/logs-table";
import type { ActivityLogsFilters } from "@/lib/admin/queries";
import type { ActivityEventType } from "@/lib/supabase/types";

const PAGE_SIZE = 25;

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const userId = params.userId && params.userId !== "all" ? params.userId : undefined;
  const eventType =
    params.eventType && params.eventType !== "all"
      ? (params.eventType as ActivityEventType)
      : undefined;

  const filters: Omit<ActivityLogsFilters, "page" | "pageSize"> = {
    userId,
    eventType,
    dateFrom: params.from,
    dateTo: params.to,
  };

  const [{ rows, total }, users] = await Promise.all([
    getActivityLogsList({ ...filters, page, pageSize: PAGE_SIZE }),
    getAllUsersForFilter(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Activity logs</h1>
        <p className="text-sm text-muted-foreground">
          Every login, upload, purchase and profile change across Trusta.
        </p>
      </div>

      <LogsFiltersBar
        defaults={{
          userId: params.userId,
          eventType: params.eventType,
          from: params.from,
          to: params.to,
        }}
        users={users}
      />

      <LogsTable
        rows={rows}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        searchParams={params}
        exportFilters={filters}
      />
    </div>
  );
}
