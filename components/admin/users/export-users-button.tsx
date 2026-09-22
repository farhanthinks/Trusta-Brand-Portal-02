"use client";

import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { exportUsersList } from "@/app/(admin)/admin/users/actions";
import { formatDate } from "@/lib/format";
import type { UsersListFilters, UserListRow } from "@/lib/admin/queries";

export function ExportUsersButton({
  filters,
}: {
  filters: Omit<UsersListFilters, "page" | "pageSize">;
}) {
  return (
    <ExportCsvButton
      fetchRows={exportUsersList.bind(null, filters)}
      filenamePrefix="trusta-users"
      toRow={(row: UserListRow) => ({
        business_name: row.business_name,
        email: row.email,
        business_type: row.business_type,
        status: row.status,
        joined: formatDate(row.created_at),
        last_active: row.last_active_at ? formatDate(row.last_active_at) : "—",
        is_admin: row.is_admin,
        is_suspended: row.is_suspended,
      })}
    />
  );
}
