"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "@/components/admin/pagination";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { formatDateTime } from "@/lib/format";
import { exportApprovalHistory } from "@/app/(admin)/admin/approvals/actions";
import type { ApprovalHistoryFilters, ApprovalHistoryRow } from "@/lib/admin/queries";

const ACTION_LABEL: Record<string, string> = {
  verified: "Verified",
  rejected_verification: "Rejected (verification)",
  approved: "Approved",
  rejected_approval: "Rejected (approval)",
};

function actionVariant(action: string): "default" | "secondary" | "destructive" {
  if (action === "verified" || action === "approved") return "default";
  if (action.startsWith("rejected")) return "destructive";
  return "secondary";
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
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Performed by</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No decisions match these filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={`${row.source}-${row.id}`}>
                  <TableCell className="font-medium">{row.business_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={actionVariant(row.action)}>
                      {ACTION_LABEL[row.action] ?? row.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.performed_by_email ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {row.remarks ?? "—"}
                  </TableCell>
                  <TableCell>{formatDateTime(row.created_at)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/admin/approvals"
        searchParams={searchParams}
      />
    </div>
  );
}
