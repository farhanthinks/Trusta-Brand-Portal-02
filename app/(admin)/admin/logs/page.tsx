import { Building2, CalendarClock, Activity } from "lucide-react";
import { getBrandActivitySummary, getAllUsersForFilter, getActivityStats } from "@/lib/admin/queries";
import { ActivityFilters } from "@/components/admin/logs/activity-filters";
import { ActivityBrandTable } from "@/components/admin/logs/activity-brand-table";
import { PageHeader } from "@/components/admin/page-header";
import { ExportSummaryButton } from "@/components/admin/logs/export-summary-button";
import { StatCard } from "@/components/admin/stat-card";
import { LiveRefresh } from "@/components/admin/live-refresh";
import { sweepExpiredSessions } from "@/lib/admin/sessions";
import type { BrandActivitySummaryFilters } from "@/lib/admin/queries";
import type { ActivityEventType } from "@/lib/supabase/types";

const PAGE_SIZE = 20;

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const userId = params.userId && params.userId !== "all" ? params.userId : undefined;
  const eventType =
    params.eventType && params.eventType !== "all" ? (params.eventType as ActivityEventType) : undefined;

  const filters: Omit<BrandActivitySummaryFilters, "page" | "pageSize"> = {
    search: params.q,
    userId,
    eventType,
    dateFrom: params.from,
    dateTo: params.to,
  };

  // Close out any timed-out session before reading, so a freshly-expired
  // session's `session_expired` event shows up without waiting on the next
  // heartbeat elsewhere to sweep it — see lib/admin/sessions.ts.
  await sweepExpiredSessions();

  const [{ rows, total, page: effectivePage }, users, stats] = await Promise.all([
    getBrandActivitySummary({ ...filters, page, pageSize: PAGE_SIZE }),
    getAllUsersForFilter(),
    getActivityStats(),
  ]);

  return (
    <div>
      <LiveRefresh intervalMs={15000} />
      <PageHeader
        title="Activity Logs"
        description="Monitor activity across all brands in the Trusta platform."
        action={<ExportSummaryButton filters={filters} />}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Building2} label="Brands Found" count={total} description="Matching current filters" />
        <StatCard
          icon={CalendarClock}
          label="Total Events Today"
          count={stats.today}
          description="Across all brands"
        />
        <StatCard
          icon={Activity}
          label="Total Events (All Time)"
          count={stats.total}
          description="Every recorded brand event"
        />
      </div>

      <ActivityFilters
        basePath="/admin/logs"
        defaults={{
          q: params.q,
          userId: params.userId,
          eventType: params.eventType,
          from: params.from,
          to: params.to,
        }}
        users={users.map((u) => ({ id: u.user_id, label: u.business_name ?? u.email ?? u.user_id }))}
      />

      <ActivityBrandTable
        rows={rows}
        page={effectivePage}
        pageSize={PAGE_SIZE}
        total={total}
        searchParams={params}
      />
    </div>
  );
}
