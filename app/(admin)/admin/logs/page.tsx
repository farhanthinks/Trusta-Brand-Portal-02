import { getBrandActivitySummary, getAllUsersForFilter } from "@/lib/admin/queries";
import { ActivityFilters } from "@/components/admin/logs/activity-filters";
import { ActivityBrandTable } from "@/components/admin/logs/activity-brand-table";
import { PageHeader } from "@/components/admin/page-header";
import { ExportSummaryButton } from "@/components/admin/logs/export-summary-button";
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

  const [{ rows, total }, users] = await Promise.all([
    getBrandActivitySummary({ ...filters, page, pageSize: PAGE_SIZE }),
    getAllUsersForFilter(),
  ]);

  return (
    <div>
      <PageHeader
        title="Activity Logs"
        description="Monitor activity across all brands in the Trusta platform."
        action={<ExportSummaryButton filters={filters} />}
      />

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

      <p className="mb-3 text-sm text-muted-foreground">{total} brands found</p>

      <ActivityBrandTable rows={rows} page={page} pageSize={PAGE_SIZE} total={total} searchParams={params} />
    </div>
  );
}
