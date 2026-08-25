import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-10 flex items-center justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="size-8 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
