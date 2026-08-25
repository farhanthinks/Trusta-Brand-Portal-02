import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "@/components/admin/pagination";
import { formatDateTime, formatDuration } from "@/lib/format";
import type { SessionRow } from "@/lib/admin/queries";

export function SessionsTable({
  rows,
  page,
  pageSize,
  total,
  searchParams,
}: {
  rows: SessionRow[];
  page: number;
  pageSize: number;
  total: number;
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Login</TableHead>
              <TableHead>Logout</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No sessions match these filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.business_name ?? row.email ?? row.user_id}
                  </TableCell>
                  <TableCell>{formatDateTime(row.login_at)}</TableCell>
                  <TableCell>{formatDateTime(row.logout_at)}</TableCell>
                  <TableCell>
                    {row.duration_seconds !== null
                      ? formatDuration(row.duration_seconds)
                      : row.is_live
                      ? "ongoing"
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {row.is_live ? (
                      <Badge className="gap-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        page={page}
        pageSize={pageSize}
        total={total}
        basePath="/admin/sessions"
        searchParams={searchParams}
      />
    </div>
  );
}
