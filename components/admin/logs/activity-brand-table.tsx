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
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* min-w keeps columns from being crushed illegibly — contained
          horizontal scroll only kicks in below that, i.e. on small
          screens, never on a normal desktop width. */}
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[780px] table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[28%] py-3">Brand</TableHead>
              <TableHead className="w-[18%] py-3">Last Activity</TableHead>
              <TableHead className="w-[24%] py-3">Last Event</TableHead>
              <TableHead className="w-[12%] py-3 text-center">Events Today</TableHead>
              <TableHead className="w-[12%] py-3 text-center">Total Events</TableHead>
              <TableHead className="w-[6%] py-3 text-center">Action</TableHead>
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
