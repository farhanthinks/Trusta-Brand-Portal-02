"use server";

import { requireAdmin } from "@/lib/admin/require-admin";
import {
  getBrandActivitySummary,
  getAllBrandActivityLogs,
  type BrandActivitySummaryFilters,
  type BrandActivityLogsFilters,
} from "@/lib/admin/queries";

export async function exportBrandActivitySummary(
  filters: Omit<BrandActivitySummaryFilters, "page" | "pageSize">
) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { error: "Not authorized" };

  const { rows } = await getBrandActivitySummary({ ...filters, page: 1, pageSize: 10000 });
  return rows;
}

export async function exportBrandActivityLogs(
  filters: Omit<BrandActivityLogsFilters, "page" | "pageSize">
) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { error: "Not authorized" };

  return getAllBrandActivityLogs(filters);
}
