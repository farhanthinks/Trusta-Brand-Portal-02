"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { MonitorX, Loader2 } from "lucide-react";

import { logoutAllDevices } from "@/app/(dashboard)/dashboard/settings/actions";
import { Button } from "@/components/ui/button";
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

export function LogoutAllDevicesDialog() {
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await logoutAllDevices();
      } catch (err) {
        // A successful call redirects, which Next surfaces as a thrown
        // NEXT_REDIRECT — anything else is a real failure worth a toast.
        if (!(err instanceof Error) || !err.message.includes("NEXT_REDIRECT")) {
          toast.error("Couldn't log out of all devices. Try again.");
        }
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MonitorX className="size-4" />
          Log out of all devices
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log out of all devices?</DialogTitle>
          <DialogDescription>
            This ends every active session, including this one. You&apos;ll need to sign in again
            everywhere.
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
            Log out everywhere
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
