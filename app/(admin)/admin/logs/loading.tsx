import { PageHeaderSkeleton, FiltersBarSkeleton, TableSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FiltersBarSkeleton />
      <TableSkeleton rows={12} cols={4} />
    </div>
  );
}
