"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-16 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="size-6 text-primary" />
      </div>
      <p className="text-sm font-medium">Unable to load dashboard</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Something went wrong while fetching your account data.
      </p>
      <Button className="mt-4" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
