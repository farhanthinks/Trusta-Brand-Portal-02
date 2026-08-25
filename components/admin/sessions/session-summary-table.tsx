import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDuration } from "@/lib/format";
import type { UserSessionSummaryRow } from "@/lib/admin/queries";

export function SessionSummaryTable({ rows }: { rows: UserSessionSummaryRow[] }) {
  const top = rows.slice(0, 10);

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Time on platform (last 7 days)</h2>
        <p className="text-xs text-muted-foreground">Top 10 most active users</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Today</TableHead>
              <TableHead>This week</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {top.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  No session activity in the last 7 days.
                </TableCell>
              </TableRow>
            ) : (
              top.map((row) => (
                <TableRow key={row.user_id}>
                  <TableCell className="font-medium">
                    {row.business_name ?? row.email ?? row.user_id}
                  </TableCell>
                  <TableCell>{formatDuration(row.totalTodaySeconds)}</TableCell>
                  <TableCell>{formatDuration(row.totalThisWeekSeconds)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
