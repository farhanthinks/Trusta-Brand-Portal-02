import { notFound } from "next/navigation";
import {
  getBrandActivityProfile,
  getBrandActivityLogs,
  getBrandActivityBrandStats,
} from "@/lib/admin/queries";
import { BrandActivityHeader } from "@/components/admin/logs/brand-activity-header";
import { ActivityStats } from "@/components/admin/logs/activity-stats";
import { ActivityFilters } from "@/components/admin/logs/activity-filters";
import { BrandActivityTimeline } from "@/components/admin/logs/brand-activity-timeline";
import { ExportBrandLogsButton } from "@/components/admin/logs/export-brand-logs-button";
import type { ActivityEventType } from "@/lib/supabase/types";
import type { BrandActivityLogsFilters } from "@/lib/admin/queries";

const DEFAULT_PAGE_SIZE = 20;

export default async function BrandActivityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { brandId } = await params;
  const sp = await searchParams;

  const profile = await getBrandActivityProfile(brandId);
  if (!profile) notFound();

  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const pageSize = [20, 50, 100].includes(Number(sp.pageSize)) ? Number(sp.pageSize) : DEFAULT_PAGE_SIZE;
  const eventType =
    sp.eventType && sp.eventType !== "all" ? (sp.eventType as ActivityEventType) : undefined;

  const filters: Omit<BrandActivityLogsFilters, "page" | "pageSize" | "brandId"> = {
    eventType,
    dateFrom: sp.from,
    dateTo: sp.to,
  };
  const exportFilters: Omit<BrandActivityLogsFilters, "page" | "pageSize"> = { brandId, ...filters };

  const [{ rows, total }, stats] = await Promise.all([
    getBrandActivityLogs({ brandId, page, pageSize, ...filters }),
    getBrandActivityBrandStats(brandId),
  ]);

  return (
    <div>
      <BrandActivityHeader profile={profile} />

      <ActivityStats
        totalEvents={stats.total}
        eventsToday={stats.today}
        userCount={1}
        memberSince={profile.brand.created_at}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">All Activity Logs</h2>
        <ExportBrandLogsButton
          filters={exportFilters}
          userEmail={profile.email}
          filenamePrefix={`trusta-activity-${profile.brand.business_name ?? brandId}`}
        />
      </div>

      <ActivityFilters
        basePath={`/admin/logs/${brandId}`}
        defaults={{ eventType: sp.eventType, from: sp.from, to: sp.to }}
        showSearch={false}
      />

      <BrandActivityTimeline
        rows={rows}
        userEmail={profile.email}
        page={page}
        pageSize={pageSize}
        total={total}
        basePath={`/admin/logs/${brandId}`}
        searchParams={sp}
      />
    </div>
  );
}
