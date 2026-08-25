import { PageHeaderSkeleton, CardGridSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <CardGridSkeleton count={8} />
    </div>
  );
}
