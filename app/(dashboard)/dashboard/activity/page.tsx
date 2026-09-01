import Link from "next/link";
import { ChevronLeft, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBrand } from "@/lib/supabase/queries";
import { EVENT_META, getEventLabel } from "@/components/admin/activity-event-meta";
import { AdminPagination } from "@/components/admin/pagination";
import { formatDateTime } from "@/lib/format";
import type { ActivityLog } from "@/lib/supabase/types";

const PAGE_SIZE = 25;

async function getActivityPage(brandId: string, page: number) {
  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact" })
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .range(from, to);

  return { rows: (data ?? []) as ActivityLog[], total: count ?? 0 };
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const brand = await getCurrentBrand();
  if (!brand) return null;

  const { rows, total } = await getActivityPage(brand.id, page);

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <Activity className="size-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Your Activity</h1>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No activity recorded yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <ul className="divide-y">
            {rows.map((log) => {
              const meta = EVENT_META[log.event_type];
              const Icon = meta.icon;
              return (
                <li key={log.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <Icon className={`size-4 shrink-0 ${meta.color}`} />
                  <span className="flex-1">{getEventLabel(log.event_type, log.metadata)}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(log.created_at)}
                  </span>
                </li>
              );
            })}
          </ul>
          <AdminPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            basePath="/dashboard/activity"
            searchParams={params}
          />
        </div>
      )}
    </div>
  );
}
