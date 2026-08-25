import { getUsersList } from "@/lib/admin/queries";
import { UsersFiltersBar } from "@/components/admin/users/filters-bar";
import { UsersTable } from "@/components/admin/users/users-table";
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

  const { rows, total } = await getUsersList({
    page,
    pageSize: PAGE_SIZE,
    search: params.q,
    status,
    businessType,
    dateFrom: params.from,
    dateTo: params.to,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          All brands registered on Trusta — search, filter, and manage access.
        </p>
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
