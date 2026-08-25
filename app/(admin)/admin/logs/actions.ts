"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { getActivityLogsList, type ActivityLogsFilters } from "@/lib/admin/queries";

export async function exportActivityLogs(filters: Omit<ActivityLogsFilters, "page" | "pageSize">) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { error: "Not authorized" };

  const { rows } = await getActivityLogsList({ ...filters, page: 1, pageSize: 10000 });
  return rows;
}
