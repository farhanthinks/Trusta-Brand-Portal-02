"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { getApprovalHistory, type ApprovalHistoryFilters } from "@/lib/admin/queries";

export async function exportApprovalHistory(
  filters: Omit<ApprovalHistoryFilters, "page" | "pageSize">
) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { error: "Not authorized" };

  const { rows } = await getApprovalHistory({ ...filters, page: 1, pageSize: 10000 });
  return rows;
}
