import { PageHeaderSkeleton, FiltersBarSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-white p-5">
            <Skeleton className="mb-3 h-5 w-28" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
      <FiltersBarSkeleton />
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[780px] table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%] py-3">Brand</TableHead>
                <TableHead className="w-[18%] py-3">Last Activity</TableHead>
                <TableHead className="w-[24%] py-3">Last Event</TableHead>
                <TableHead className="w-[12%] py-3 text-center">Events Today</TableHead>
                <TableHead className="w-[12%] py-3 text-center">Total Events</TableHead>
                <TableHead className="w-[6%] py-3 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-0">
                    <div className="flex min-h-14 items-center gap-2.5">
                      <Skeleton className="size-8 shrink-0 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-0">
                    <div className="flex min-h-14 items-center">
                      <Skeleton className="h-3.5 w-28" />
                    </div>
                  </TableCell>
                  <TableCell className="py-0">
                    <div className="flex min-h-14 items-center">
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                  </TableCell>
                  <TableCell className="py-0 text-center">
                    <div className="flex min-h-14 items-center justify-center">
                      <Skeleton className="h-5 w-8 rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell className="py-0 text-center">
                    <div className="flex min-h-14 items-center justify-center">
                      <Skeleton className="h-3.5 w-8" />
                    </div>
                  </TableCell>
                  <TableCell className="py-0 text-center">
                    <div className="flex min-h-14 items-center justify-center">
                      <Skeleton className="size-7 rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
