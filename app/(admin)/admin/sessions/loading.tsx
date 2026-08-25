import { PageHeaderSkeleton, FiltersBarSkeleton, TableSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="mb-6">
        <TableSkeleton rows={5} cols={3} />
      </div>
      <FiltersBarSkeleton />
      <TableSkeleton rows={10} cols={5} />
    </div>
  );
}
