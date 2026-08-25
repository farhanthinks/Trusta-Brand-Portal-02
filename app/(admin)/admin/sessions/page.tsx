import { getSessionsList, getAllSessionSummaries } from "@/lib/admin/queries";
import { SessionsFiltersBar } from "@/components/admin/sessions/sessions-filters-bar";
import { SessionsTable } from "@/components/admin/sessions/sessions-table";
import { SessionSummaryTable } from "@/components/admin/sessions/session-summary-table";

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Active sessions</h1>
        <p className="text-sm text-muted-foreground">
          Login/logout history and time-on-platform tracking.
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
