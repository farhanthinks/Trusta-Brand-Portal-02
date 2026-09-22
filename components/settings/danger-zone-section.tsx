"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { AlertTriangle, UserX, Trash2, Loader2 } from "lucide-react";

import { deactivateAccount, deleteOwnAccount } from "@/app/(dashboard)/dashboard/settings/actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

// A successful call redirects, which Next surfaces to this catch block as a
// thrown NEXT_REDIRECT — anything else is a real failure worth a toast.
function isRedirectThrow(err: unknown): boolean {
  return err instanceof Error && err.message.includes("NEXT_REDIRECT");
}

function DeactivateDialog() {
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deactivateAccount();
      } catch (err) {
        if (!isRedirectThrow(err)) toast.error("Couldn't deactivate your account. Try again.");
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserX className="size-4" />
          Deactivate account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate your account?</DialogTitle>
          <DialogDescription>
            You&apos;ll be signed out everywhere and won&apos;t be able to log back in until support
            reactivates your account. Your data is kept — this is reversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog() {
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteOwnAccount();
      } catch (err) {
        if (!isRedirectThrow(err)) toast.error("Couldn't delete your account. Try again.");
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="size-4" />
          Delete account permanently
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permanently delete your account?</DialogTitle>
          <DialogDescription>
            This deletes your profile, brand, orders, and all history. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DangerZoneSection() {
  return (
    <Card className="ring-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-4" />
          Danger Zone
        </CardTitle>
        <CardDescription>Deactivating or deleting your account can&apos;t be undone lightly.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Deactivate account</p>
            <p className="text-sm text-muted-foreground">
              Temporarily disable access. Contact support to reactivate.
            </p>
          </div>
          <DeactivateDialog />
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Permanently delete account</p>
            <p className="text-sm text-muted-foreground">
              Erases your account and all associated data. Irreversible.
            </p>
          </div>
          <DeleteAccountDialog />
        </div>
      </CardContent>
    </Card>
  );
}
