import { Skeleton } from "@/components/ui/skeleton";
import { FiltersBarSkeleton, TableSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-4 h-4 w-48" />
      <Skeleton className="mb-6 h-28 w-full rounded-xl" />
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="mb-4 h-6 w-40" />
      <FiltersBarSkeleton />
      <TableSkeleton rows={10} cols={5} />
    </div>
  );
}
