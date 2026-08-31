import { Users2 } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { ActivityBrandRow } from "./activity-brand-row";
import type { BrandActivitySummaryRow } from "@/lib/supabase/types";

export function ActivityBrandTable({
  rows,
  page,
  pageSize,
  total,
  searchParams,
}: {
  rows: BrandActivitySummaryRow[];
  page: number;
  pageSize: number;
  total: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Users2}
        heading="No brands found"
        description="No brands match your search or filters."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Last Event</TableHead>
              <TableHead>Events Today</TableHead>
              <TableHead>Total Events</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <ActivityBrandRow key={row.brand_id} row={row} />
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/admin/logs"
        searchParams={searchParams}
      />
    </div>
  );
}
