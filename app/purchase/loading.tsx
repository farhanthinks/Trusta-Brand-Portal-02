import { CardGridSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-2 h-7 w-56" />
      <Skeleton className="mb-8 h-4 w-80" />
      <CardGridSkeleton count={4} />
    </div>
  );
}
