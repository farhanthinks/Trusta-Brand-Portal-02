import { Suspense } from "react";
import { TileSkeleton } from "@/components/admin/overview/bento-tile";
import { ActiveUsersTile } from "@/components/admin/overview/active-users-tile";
import { PendingApprovalsTile } from "@/components/admin/overview/pending-approvals-tile";
import { BrandsOverviewTile } from "@/components/admin/overview/brands-overview-tile";
import { NewRegistrationsTile } from "@/components/admin/overview/new-registrations-tile";
import { RevenueTile } from "@/components/admin/overview/revenue-tile";
import { RecentActivityTile } from "@/components/admin/overview/recent-activity-tile";
import { AvgTurnaroundTile } from "@/components/admin/overview/avg-turnaround-tile";
import { QuickActionsTile } from "@/components/admin/overview/quick-actions-tile";

export default function AdminOverviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of brand activity, approvals and revenue across Trusta.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Suspense fallback={<TileSkeleton className="col-span-2 lg:col-span-2 lg:row-span-2" />}>
          <ActiveUsersTile className="col-span-2 lg:col-span-2 lg:row-span-2" />
        </Suspense>

        <Suspense fallback={<TileSkeleton />}>
          <PendingApprovalsTile />
        </Suspense>

        <Suspense fallback={<TileSkeleton />}>
          <BrandsOverviewTile />
        </Suspense>

        <Suspense fallback={<TileSkeleton />}>
          <NewRegistrationsTile />
        </Suspense>

        <Suspense fallback={<TileSkeleton />}>
          <RevenueTile />
        </Suspense>

        <Suspense fallback={<TileSkeleton className="col-span-2 lg:col-span-4" />}>
          <RecentActivityTile className="col-span-2 lg:col-span-4" />
        </Suspense>

        <Suspense fallback={<TileSkeleton className="col-span-1 lg:col-span-2" />}>
          <AvgTurnaroundTile className="col-span-1 lg:col-span-2" />
        </Suspense>

        <QuickActionsTile className="col-span-1 lg:col-span-2" />
      </div>
    </div>
  );
}
