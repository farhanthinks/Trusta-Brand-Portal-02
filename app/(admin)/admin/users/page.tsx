import { getUsersList } from "@/lib/admin/queries";
import { UsersFiltersBar } from "@/components/admin/users/filters-bar";
import { UsersTable } from "@/components/admin/users/users-table";
import { SortSelect } from "@/components/admin/users/sort-select";
import { ExportUsersButton } from "@/components/admin/users/export-users-button";
import { PageHeader } from "@/components/admin/page-header";
import { RefreshButton } from "@/components/admin/refresh-button";
import type { BrandStatus } from "@/lib/supabase/types";
import type { UsersListSort } from "@/lib/admin/queries";

const PAGE_SIZE = 20;
const SORT_VALUES: UsersListSort[] = ["newest", "oldest", "name_asc", "name_desc"];

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
  const sort: UsersListSort = SORT_VALUES.includes(params.sort as UsersListSort)
    ? (params.sort as UsersListSort)
    : "newest";

  const filters = {
    search: params.q,
    status,
    businessType,
    dateFrom: params.from,
    dateTo: params.to,
    sort,
  };

  const { rows, total } = await getUsersList({ ...filters, page, pageSize: PAGE_SIZE });

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage registered brands and their accounts."
        action={
          <div className="flex gap-2">
            <RefreshButton />
            <ExportUsersButton filters={filters} />
          </div>
        }
      />

      <UsersFiltersBar
        defaults={{
          q: params.q,
          status: params.status,
          businessType: params.businessType,
          from: params.from,
          to: params.to,
        }}
      />

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">
          {total} User{total === 1 ? "" : "s"}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by</span>
          <SortSelect value={sort} />
        </div>
      </div>

      <UsersTable rows={rows} page={page} pageSize={PAGE_SIZE} total={total} searchParams={params} />
    </div>
  );
}
