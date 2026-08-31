"use client";

import { CheckCircle2, XCircle, User, MessageSquare, History } from "lucide-react";
import { AdminPagination } from "@/components/admin/pagination";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { ListItemCard } from "@/components/admin/list-item-card";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime } from "@/lib/format";
import { exportApprovalHistory } from "@/app/(admin)/admin/approvals/actions";
import type { ApprovalHistoryFilters, ApprovalHistoryRow } from "@/lib/admin/queries";

const ACTION_LABEL: Record<string, string> = {
  verified: "Verified",
  rejected_verification: "Rejected (verification)",
  approved: "Approved",
  rejected_approval: "Rejected (approval)",
};

const ACTION_STYLES: Record<string, string> = {
  verified: "bg-emerald-100 text-emerald-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected_verification: "bg-red-100 text-red-700",
  rejected_approval: "bg-red-100 text-red-700",
};

function isRejected(action: string) {
  return action.startsWith("rejected");
}

export function ApprovalsTable({
  rows,
  page,
  pageSize,
  total,
  searchParams,
  exportFilters,
}: {
  rows: ApprovalHistoryRow[];
  page: number;
  pageSize: number;
  total: number;
  searchParams: Record<string, string | undefined>;
  exportFilters: Omit<ApprovalHistoryFilters, "page" | "pageSize">;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-xl border bg-white px-4 py-3">
        <span className="text-sm text-muted-foreground">{total} decisions</span>
        <ExportCsvButton
          fetchRows={exportApprovalHistory.bind(null, exportFilters)}
          filenamePrefix="trusta-approval-history"
          toRow={(row: ApprovalHistoryRow) => ({
            brand: row.business_name,
            action: ACTION_LABEL[row.action] ?? row.action,
            performed_by: row.performed_by_email,
            remarks: row.remarks,
            timestamp: row.created_at,
          })}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={History}
          heading="No decisions yet"
          description="No verification or approval decisions match these filters."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <ListItemCard
              key={`${row.source}-${row.id}`}
              avatar={
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                    isRejected(row.action) ? "bg-red-50 text-destructive" : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {isRejected(row.action) ? (
                    <XCircle className="size-5" />
                  ) : (
                    <CheckCircle2 className="size-5" />
                  )}
                </div>
              }
              title={row.business_name ?? "Unnamed business"}
              subtitle={row.performed_by_email ? `By ${row.performed_by_email}` : undefined}
              meta={[
                { icon: User, label: formatDateTime(row.created_at) },
                ...(row.remarks ? [{ icon: MessageSquare, label: row.remarks }] : []),
              ]}
              badge={
                <span
                  className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                    ACTION_STYLES[row.action] ?? "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {ACTION_LABEL[row.action] ?? row.action}
                </span>
              }
              showChevron={false}
            />
          ))}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border bg-white">
        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={total}
          basePath="/admin/approvals"
          searchParams={searchParams}
        />
      </div>
    </div>
  );
}
