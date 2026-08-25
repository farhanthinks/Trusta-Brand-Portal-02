import { getApprovalHistory, getAdminsList } from "@/lib/admin/queries";
import { ApprovalsFiltersBar } from "@/components/admin/approvals/approvals-filters-bar";
import { ApprovalsTable } from "@/components/admin/approvals/approvals-table";
import type { ApprovalHistoryFilters } from "@/lib/admin/queries";

const PAGE_SIZE = 20;

export default async function AdminApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const actionType =
    params.actionType && params.actionType !== "all"
      ? (params.actionType as ApprovalHistoryFilters["actionType"])
      : undefined;
  const adminId = params.adminId && params.adminId !== "all" ? params.adminId : undefined;

  const filters: Omit<ApprovalHistoryFilters, "page" | "pageSize"> = {
    actionType,
    adminId,
    dateFrom: params.from,
    dateTo: params.to,
  };

  const [{ rows, total }, admins] = await Promise.all([
    getApprovalHistory({ ...filters, page, pageSize: PAGE_SIZE }),
    getAdminsList(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Approval history</h1>
        <p className="text-sm text-muted-foreground">
          Every verification and approval decision made across Trusta.
        </p>
      </div>

      <ApprovalsFiltersBar
        defaults={{
          actionType: params.actionType,
          adminId: params.adminId,
          from: params.from,
          to: params.to,
        }}
        admins={admins}
      />

      <ApprovalsTable
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
