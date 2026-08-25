import { PageHeaderSkeleton, FiltersBarSkeleton, TableSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <FiltersBarSkeleton />
      <TableSkeleton rows={10} cols={7} />
    </div>
  );
}
