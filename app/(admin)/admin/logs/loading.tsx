import { PageHeaderSkeleton, FiltersBarSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FiltersBarSkeleton />
      <Skeleton className="mb-3 h-4 w-28" />
      <div className="overflow-hidden rounded-xl border bg-white">
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
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-8 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-4" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
