import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton() {
  return (
    <div className="mb-6 space-y-2">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-80" />
    </div>
  );
}

export function FiltersBarSkeleton() {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-40 space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-6 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-white p-5">
          <Skeleton className="mb-3 h-5 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="mt-3 h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="mx-auto w-full max-w-lg space-y-4 rounded-xl border bg-white p-6">
      <Skeleton className="h-6 w-40" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function CenteredSpinnerSkeleton() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
