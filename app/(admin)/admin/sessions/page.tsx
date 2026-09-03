import { Radio, CalendarClock, ListChecks, Clock3 } from "lucide-react";
import { getSessionsList, getAllSessionSummaries, getSessionStats } from "@/lib/admin/queries";
import { sweepExpiredSessions } from "@/lib/admin/sessions";
import { SessionsFiltersBar } from "@/components/admin/sessions/sessions-filters-bar";
import { SessionsTable } from "@/components/admin/sessions/sessions-table";
import { SessionSummaryTable } from "@/components/admin/sessions/session-summary-table";
import { LiveRefresh } from "@/components/admin/live-refresh";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { formatDuration } from "@/lib/format";

// This page's whole point is showing current state — never let it serve a
// cached render. Also belt-and-suspenders against the fetch/data cache,
// on top of the dynamic rendering that createClient()'s cookies() usage
// already forces.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 25;

export default async function AdminSessionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const status =
    params.status === "active" || params.status === "inactive" ? params.status : undefined;

  // Close out any session that's timed out since the last heartbeat swept
  // it, so this render never shows a session as "Active" that's actually
  // just gone quiet — see lib/admin/sessions.ts.
  await sweepExpiredSessions();

  const [{ rows, total }, summaries, stats] = await Promise.all([
    getSessionsList({ page, pageSize: PAGE_SIZE, status }),
    getAllSessionSummaries(),
    getSessionStats(),
  ]);

  return (
    <div>
      <LiveRefresh intervalMs={15000} />
      <PageHeader
        title="Active sessions"
        description={
          <span className="flex items-center gap-1.5">
            Login/logout history and time-on-platform tracking.
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              live
            </span>
          </span>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Radio}
          label="Active Now"
          count={stats.activeNow}
          description="Live within the last 3 min"
        />
        <StatCard
          icon={CalendarClock}
          label="Sessions Today"
          count={stats.sessionsToday}
          description="Logins since midnight IST"
        />
        <StatCard
          icon={ListChecks}
          label="Total Sessions"
          count={stats.totalSessions}
          description="All recorded sessions"
        />
        <StatCard
          icon={Clock3}
          label="Total Time"
          count={formatDuration(stats.totalTimeSeconds)}
          description="Cumulative time on platform"
        />
      </div>

      <div className="mb-6">
        <SessionSummaryTable rows={summaries} />
      </div>

      <SessionsFiltersBar defaults={{ status: params.status }} />

      <SessionsTable
        rows={rows}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        searchParams={params}
      />
    </div>
  );
}
