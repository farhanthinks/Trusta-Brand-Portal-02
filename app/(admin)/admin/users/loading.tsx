import { PageHeaderSkeleton, FiltersBarSkeleton, TableSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FiltersBarSkeleton />
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-44" />
      </div>
      <TableSkeleton rows={10} cols={7} />
    </div>
  );
}
