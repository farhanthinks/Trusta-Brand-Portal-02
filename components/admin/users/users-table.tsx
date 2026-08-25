"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, ShieldCheck, ShieldOff, Ban, CheckCircle2, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setSuspended, setAdminRole, bulkSetSuspended } from "@/app/(admin)/admin/users/actions";
import { UserDetailSheet } from "./user-detail-sheet";
import { AdminPagination } from "@/components/admin/pagination";
import { formatDate } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";
import type { UserListRow } from "@/lib/admin/queries";

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
}

export function UsersTable({
  rows,
  page,
  pageSize,
  total,
  searchParams,
}: {
  rows: UserListRow[];
  page: number;
  pageSize: number;
  total: number;
  searchParams: Record<string, string | undefined>;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailRow, setDetailRow] = useState<UserListRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.user_id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.user_id)));
    }
  }

  function toggleOne(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function handleSuspendToggle(row: UserListRow) {
    setBusyId(row.user_id);
    const result = await setSuspended(row.user_id, !row.is_suspended);
    setBusyId(null);
    if (result.error) toast.error(result.error);
    else toast.success(row.is_suspended ? "User reactivated" : "User suspended");
  }

  async function handleAdminToggle(row: UserListRow) {
    setBusyId(row.user_id);
    const result = await setAdminRole(row.user_id, !row.is_admin);
    setBusyId(null);
    if (result.error) toast.error(result.error);
    else toast.success(row.is_admin ? "Admin access revoked" : "Promoted to admin");
  }

  async function handleBulkSuspend(suspend: boolean) {
    setBulkBusy(true);
    const ids = Array.from(selected);
    const result = await bulkSetSuspended(ids, suspend);
    setBulkBusy(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(`${ids.length} user(s) ${suspend ? "suspended" : "reactivated"}`);
      setSelected(new Set());
    }
  }

  function handleExportSelected() {
    const selectedRows = rows.filter((r) => selected.has(r.user_id));
    const target = selectedRows.length > 0 ? selectedRows : rows;
    const csv = toCsv(
      target.map((r) => ({
        business_name: r.business_name,
        email: r.email,
        business_type: r.business_type,
        status: r.status,
        joined: r.created_at,
        last_active: r.last_active_at,
        is_admin: r.is_admin,
        is_suspended: r.is_suspended,
      }))
    );
    downloadCsv(`trusta-users-${Date.now()}.csv`, csv);
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      {selected.size > 0 && (
        <div className="flex items-center justify-between border-b bg-red-50/60 px-4 py-2.5">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulkSuspend(true)} disabled={bulkBusy}>
              <Ban className="size-4" />
              Suspend
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkSuspend(false)} disabled={bulkBusy}>
              <CheckCircle2 className="size-4" />
              Reactivate
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportSelected} disabled={bulkBusy}>
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Business type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No users match these filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.brand_id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("[data-no-row-click]")) return;
                    setDetailRow(row);
                    setSheetOpen(true);
                  }}
                >
                  <TableCell data-no-row-click onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(row.user_id)}
                      onCheckedChange={() => toggleOne(row.user_id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {row.business_name ?? "Unnamed business"}
                    {row.is_admin && (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        admin
                      </Badge>
                    )}
                    {row.is_suspended && (
                      <Badge variant="destructive" className="ml-2 text-[10px]">
                        suspended
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.email ?? "—"}</TableCell>
                  <TableCell>{row.business_type ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(row.status)} className="capitalize">
                      {row.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(row.created_at)}</TableCell>
                  <TableCell>{formatDate(row.last_active_at)}</TableCell>
                  <TableCell data-no-row-click onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={busyId === row.user_id}>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSuspendToggle(row)}>
                          {row.is_suspended ? (
                            <>
                              <CheckCircle2 className="size-4" />
                              Reactivate
                            </>
                          ) : (
                            <>
                              <Ban className="size-4" />
                              Suspend
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAdminToggle(row)}>
                          {row.is_admin ? (
                            <>
                              <ShieldOff className="size-4" />
                              Revoke admin
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="size-4" />
                              Promote to admin
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
        basePath="/admin/users"
        searchParams={searchParams}
      />

      <UserDetailSheet row={detailRow} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
