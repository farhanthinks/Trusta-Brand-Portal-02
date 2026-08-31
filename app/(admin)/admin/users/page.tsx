import { Users2, UserCheck, UserX } from "lucide-react";
import { getUsersList, getUserStats } from "@/lib/admin/queries";
import { UsersFiltersBar } from "@/components/admin/users/filters-bar";
import { UsersTable } from "@/components/admin/users/users-table";
import { PageHeader } from "@/components/admin/page-header";
import { RefreshButton } from "@/components/admin/refresh-button";
import { StatCard } from "@/components/admin/stat-card";
import type { BrandStatus } from "@/lib/supabase/types";

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const status = params.status && params.status !== "all" ? (params.status as BrandStatus) : undefined;
  const businessType =
    params.businessType && params.businessType !== "all" ? params.businessType : undefined;

  const [{ rows, total }, stats] = await Promise.all([
    getUsersList({
      page,
      pageSize: PAGE_SIZE,
      search: params.q,
      status,
      businessType,
      dateFrom: params.from,
      dateTo: params.to,
    }),
    getUserStats(),
  ]);

  return (
    <div>
      <PageHeader
        title="Users"
        description="All brands registered on Trusta — search, filter, and manage access."
        action={<RefreshButton />}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Users2} label="Total users" count={stats.total} description="All registered brands" />
        <StatCard icon={UserCheck} label="Active" count={stats.active} description="Not suspended" />
        <StatCard icon={UserX} label="Suspended" count={stats.suspended} description="Access revoked" />
      </div>

      <UsersFiltersBar
        defaults={{
          q: params.q,
          status: params.status,
          businessType: params.businessType,
          from: params.from,
          to: params.to,
        }}
      />

      <UsersTable rows={rows} page={page} pageSize={PAGE_SIZE} total={total} searchParams={params} />
    </div>
  );
}
