import { PageHeaderSkeleton, TableSkeleton, CardGridSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="mb-6">
        <CardGridSkeleton count={4} />
      </div>
      <div className="mb-6">
        <TableSkeleton rows={6} cols={4} />
      </div>
      <div className="mb-4 flex items-center gap-3 rounded-xl border bg-white px-4 py-3">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-28" />
      </div>
      <TableSkeleton rows={10} cols={6} />
    </div>
  );
}
