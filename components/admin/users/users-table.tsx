"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  ShieldCheck,
  ShieldOff,
  Ban,
  CheckCircle2,
  Download,
  Trash2,
  Loader2,
  Building2,
  Clock,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setSuspended, setAdminRole, bulkSetSuspended, deleteBrandUser } from "@/app/(admin)/admin/users/actions";
import { UserDetailSheet } from "./user-detail-sheet";
import { AdminPagination } from "@/components/admin/pagination";
import { ListItemCard } from "@/components/admin/list-item-card";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDate } from "@/lib/format";
import { toCsv, downloadCsv } from "@/lib/csv";
import type { UserListRow } from "@/lib/admin/queries";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  verification_pending: "bg-amber-100 text-amber-700",
  verified: "bg-blue-100 text-blue-700",
  profile_completed: "bg-secondary text-secondary-foreground",
  registered: "bg-secondary text-secondary-foreground",
};

function initialsFor(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
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
  const [deleteTarget, setDeleteTarget] = useState<UserListRow | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteBrandUser(deleteTarget.user_id);
    setDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${deleteTarget.business_name ?? "Brand"} deleted`);
    setDeleteTarget(null);
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
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl border bg-red-50/60 px-4 py-2.5">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            {selected.size} selected
          </label>
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

      {rows.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          heading="No users found"
          description="No brands match these filters."
        />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <ListItemCard
              key={row.brand_id}
              onClick={() => {
                setDetailRow(row);
                setSheetOpen(true);
              }}
              leading={
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(row.user_id)}
                    onCheckedChange={() => toggleOne(row.user_id)}
                  />
                </div>
              }
              avatar={
                <Avatar className="size-12 shrink-0 border">
                  <AvatarFallback className="bg-red-50 text-sm font-semibold text-primary">
                    {initialsFor(row.business_name)}
                  </AvatarFallback>
                </Avatar>
              }
              title={
                <span className="flex flex-wrap items-center gap-2">
                  {row.business_name ?? "Unnamed business"}
                  {row.is_admin && (
                    <Badge variant="outline" className="text-[10px]">
                      admin
                    </Badge>
                  )}
                  {row.is_suspended && (
                    <Badge variant="destructive" className="text-[10px]">
                      suspended
                    </Badge>
                  )}
                </span>
              }
              subtitle={row.email ?? undefined}
              meta={[
                ...(row.business_type ? [{ icon: Building2, label: row.business_type }] : []),
                { icon: Clock, label: `Joined ${formatDate(row.created_at)}` },
                ...(row.last_active_at
                  ? [{ icon: Clock, label: `Active ${formatDate(row.last_active_at)}` }]
                  : []),
              ]}
              badge={
                <span
                  className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                    STATUS_STYLES[row.status] ?? "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {row.status.replace(/_/g, " ")}
                </span>
              }
              trailing={
                <div onClick={(e) => e.stopPropagation()}>
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
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row)}>
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
              showChevron={false}
            />
          ))}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border bg-white">
        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={total}
          basePath="/admin/users"
          searchParams={searchParams}
        />
      </div>

      <UserDetailSheet row={detailRow} open={sheetOpen} onOpenChange={setSheetOpen} />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {deleteTarget?.business_name ?? "this brand"}?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete this brand and all associated data.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
