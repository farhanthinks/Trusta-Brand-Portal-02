"use client";

import { CheckCircle2, XCircle, MessageSquare, History } from "lucide-react";
import { AdminPagination } from "@/components/admin/pagination";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { ListItemCard } from "@/components/admin/list-item-card";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime } from "@/lib/format";
import { exportApprovalHistory } from "@/app/(admin)/admin/approvals/actions";
import type { ApprovalHistoryDecision, ApprovalHistoryFilters, ApprovalHistoryRow } from "@/lib/admin/queries";

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

function stageLabel(source: "Verification" | "Approval", decision: ApprovalHistoryDecision) {
  return `${source} ${isRejected(decision.action) ? "rejected" : "done"} ${formatDateTime(decision.created_at)}`;
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
        <span className="text-sm text-muted-foreground">{total} brands</span>
        <ExportCsvButton
          fetchRows={exportApprovalHistory.bind(null, exportFilters)}
          filenamePrefix="trusta-approval-history"
          toRow={(row: ApprovalHistoryRow) => ({
            brand: row.business_name,
            verification: row.verification ? ACTION_LABEL[row.verification.action] : "",
            verified_by: row.verification?.performed_by_email ?? "",
            verified_at: row.verification?.created_at ?? "",
            approval: row.approval ? ACTION_LABEL[row.approval.action] : "",
            approved_by: row.approval?.performed_by_email ?? "",
            approved_at: row.approval?.created_at ?? "",
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
          {rows.map((row) => {
            const overallRejected =
              row.verification?.action === "rejected_verification" ||
              row.approval?.action === "rejected_approval";

            // Same admin usually handles both stages — show the email once
            // instead of repeating it per badge.
            const emails = Array.from(
              new Set(
                [row.verification?.performed_by_email, row.approval?.performed_by_email].filter(
                  (e): e is string => Boolean(e)
                )
              )
            );

            const remarks = [row.verification?.remarks, row.approval?.remarks].filter(
              (r): r is string => Boolean(r)
            );

            return (
              <ListItemCard
                key={row.brand_id}
                avatar={
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                      overallRejected ? "bg-red-50 text-destructive" : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {overallRejected ? (
                      <XCircle className="size-5" />
                    ) : (
                      <CheckCircle2 className="size-5" />
                    )}
                  </div>
                }
                title={row.business_name ?? "Unnamed business"}
                subtitle={emails.length > 0 ? `By ${emails.join(", ")}` : undefined}
                meta={[
                  ...(row.verification
                    ? [{ label: stageLabel("Verification", row.verification) }]
                    : []),
                  ...(row.approval ? [{ label: stageLabel("Approval", row.approval) }] : []),
                  ...remarks.map((r) => ({ icon: MessageSquare, label: r })),
                ]}
                badge={
                  <div className="flex flex-col items-end gap-1.5">
                    {row.verification && (
                      <span
                        className={`inline-flex min-w-[96px] items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-center text-xs font-medium ${
                          ACTION_STYLES[row.verification.action] ?? "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {ACTION_LABEL[row.verification.action]}
                      </span>
                    )}
                    {row.approval && (
                      <span
                        className={`inline-flex min-w-[96px] items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-center text-xs font-medium ${
                          ACTION_STYLES[row.approval.action] ?? "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {ACTION_LABEL[row.approval.action]}
                      </span>
                    )}
                  </div>
                }
                showChevron={false}
              />
            );
          })}
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
