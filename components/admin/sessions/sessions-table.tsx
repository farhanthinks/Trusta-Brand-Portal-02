import Link from "next/link";
import { ChevronRight, History } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDateTime, formatDuration } from "@/lib/format";
import type { SessionRow } from "@/lib/admin/queries";

function initialsFor(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function shortId(userId: string) {
  return userId.slice(0, 8).toUpperCase();
}

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
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={History}
        heading="No sessions found"
        description="No sessions match these filters."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table className="w-full min-w-[820px] table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[26%] py-3">User</TableHead>
              <TableHead className="w-[18%] py-3">Login</TableHead>
              <TableHead className="w-[18%] py-3">Logout</TableHead>
              <TableHead className="w-[14%] py-3 text-center">Duration</TableHead>
              <TableHead className="w-[18%] py-3 text-center">Status</TableHead>
              <TableHead className="w-[6%] py-3 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className={row.is_live ? "bg-emerald-50/40 hover:bg-emerald-50/60" : undefined}
              >
                <TableCell className="py-0">
                  <div className="flex min-h-14 items-center gap-2.5">
                    <Avatar className="size-8 shrink-0 border">
                      {row.logo_url && (
                        <AvatarImage src={row.logo_url} alt={row.business_name ?? ""} />
                      )}
                      <AvatarFallback className="bg-red-50 text-xs font-semibold text-primary">
                        {initialsFor(row.business_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium leading-tight">
                        {row.business_name ?? row.email ?? "Unnamed business"}
                      </p>
                      <p className="truncate text-xs leading-tight text-muted-foreground">
                        {row.email ?? `ID: ${shortId(row.user_id)}`}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="py-0">
                  <div className="flex min-h-14 items-center">
                    <span className="truncate text-sm leading-tight">
                      {formatDateTime(row.login_at)}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-0">
                  <div className="flex min-h-14 items-center">
                    <span className="truncate text-sm leading-tight text-muted-foreground">
                      {row.logout_at ? formatDateTime(row.logout_at) : "—"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-0 text-center">
                  <div className="flex min-h-14 items-center justify-center">
                    <span className="text-sm font-medium">
                      {row.duration_seconds !== null
                        ? formatDuration(row.duration_seconds)
                        : row.is_live
                        ? "ongoing"
                        : "—"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-0 text-center">
                  <div className="flex min-h-14 flex-col items-center justify-center gap-0.5">
                    {row.is_live ? (
                      <Badge className="gap-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {row.is_live && (
                      <span className="text-[11px] leading-tight text-muted-foreground">
                        Last seen {formatDateTime(row.last_seen_at)}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="py-0 text-center">
                  <div className="flex min-h-14 items-center justify-center">
                    {row.brand_id ? (
                      <Link
                        href={`/admin/logs/${row.brand_id}`}
                        title="View activity"
                        className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-red-100 hover:text-primary"
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    ) : (
                      <span className="flex size-7 items-center justify-center rounded-full bg-muted/50 text-muted-foreground/40">
                        <ChevronRight className="size-4" />
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
