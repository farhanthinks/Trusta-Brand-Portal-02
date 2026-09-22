"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, ShieldCheck, ShieldOff, Ban, CheckCircle2, Trash2, Loader2 } from "lucide-react";
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
import { setSuspended, setAdminRole, deleteBrandUser } from "@/app/(admin)/admin/users/actions";

/**
 * Same three actions as the Users table's row menu (suspend/reactivate,
 * promote/revoke admin, delete) — this is the detail-page header's copy of
 * that menu. Kept as its own small component rather than sharing the
 * table's, since deleting from here needs to navigate back to the list
 * (the record this page is showing no longer exists), while the table just
 * lets its row disappear on the next list refresh.
 */
export function UserDetailActions({
  userId,
  businessName,
  isAdmin,
  isSuspended,
}: {
  userId: string;
  businessName: string | null;
  isAdmin: boolean;
  isSuspended: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSuspendToggle() {
    setBusy(true);
    const result = await setSuspended(userId, !isSuspended);
    setBusy(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(isSuspended ? "User reactivated" : "User suspended");
      router.refresh();
    }
  }

  async function handleAdminToggle() {
    setBusy(true);
    const result = await setAdminRole(userId, !isAdmin);
    setBusy(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success(isAdmin ? "Admin access revoked" : "Promoted to admin");
      router.refresh();
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteBrandUser(userId);
    setDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${businessName ?? "Brand"} deleted`);
    router.push("/admin/users");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleSuspendToggle}>
            {isSuspended ? (
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
          <DropdownMenuItem onClick={handleAdminToggle}>
            {isAdmin ? (
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
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmingDelete(true)}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={confirmingDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) setConfirmingDelete(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {businessName ?? "this brand"}?</DialogTitle>
            <DialogDescription>
              This will permanently delete this brand and all associated data. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
