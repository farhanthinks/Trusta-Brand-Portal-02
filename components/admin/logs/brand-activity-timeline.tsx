"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { ActivityEventRow } from "./activity-event-row";
import { ActivityEventDetails } from "./activity-event-details";
import type { BrandActivityLogRow } from "@/lib/admin/queries";

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export function BrandActivityTimeline({
  rows,
  userEmail,
  page,
  pageSize,
  total,
  basePath,
  searchParams,
}: {
  rows: BrandActivityLogRow[];
  userEmail: string | null;
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const [selected, setSelected] = useState<BrandActivityLogRow | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  function handlePageSizeChange(value: string) {
    const params = new URLSearchParams(currentSearchParams.toString());
    params.set("pageSize", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        heading="No activity yet"
        description="No events match these filters."
      />
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-6" />
                <TableHead>Time &amp; Date</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <ActivityEventRow
                  key={row.id}
                  row={row}
                  userEmail={userEmail}
                  isLast={i === rows.length - 1}
                  onClick={() => setSelected(row)}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Rows per page
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={total}
          basePath={basePath}
          searchParams={searchParams}
        />
      </div>

      <ActivityEventDetails
        row={selected}
        userEmail={userEmail}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
