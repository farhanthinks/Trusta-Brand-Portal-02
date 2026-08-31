import { getSessionsList, getAllSessionSummaries } from "@/lib/admin/queries";
import { SessionsFiltersBar } from "@/components/admin/sessions/sessions-filters-bar";
import { SessionsTable } from "@/components/admin/sessions/sessions-table";
import { SessionSummaryTable } from "@/components/admin/sessions/session-summary-table";
import { LiveRefresh } from "@/components/admin/live-refresh";

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

  const [{ rows, total }, summaries] = await Promise.all([
    getSessionsList({ page, pageSize: PAGE_SIZE, status }),
    getAllSessionSummaries(),
  ]);

  return (
    <div>
      <LiveRefresh intervalMs={15000} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Active sessions</h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          Login/logout history and time-on-platform tracking.
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            live
          </span>
        </p>
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
