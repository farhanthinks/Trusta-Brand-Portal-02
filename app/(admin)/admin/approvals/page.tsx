import { CheckCircle2, XCircle } from "lucide-react";
import { getApprovalHistory, getAdminsList, getApprovalStats } from "@/lib/admin/queries";
import { ApprovalsFiltersBar } from "@/components/admin/approvals/approvals-filters-bar";
import { ApprovalsTable } from "@/components/admin/approvals/approvals-table";
import { PageHeader } from "@/components/admin/page-header";
import { RefreshButton } from "@/components/admin/refresh-button";
import { StatCard } from "@/components/admin/stat-card";
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

  const [{ rows, total }, admins, stats] = await Promise.all([
    getApprovalHistory({ ...filters, page, pageSize: PAGE_SIZE }),
    getAdminsList(),
    getApprovalStats(),
  ]);

  return (
    <div>
      <PageHeader
        title="Approval history"
        description="Every verification and approval decision made across Trusta."
        action={<RefreshButton />}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          count={stats.approved}
          description="Brands approved to date"
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          count={stats.rejected}
          description="Brands rejected to date"
        />
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
