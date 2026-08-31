"use client";

/**
 * TEMPORARY — TESTING ONLY. See app/purchase/dummy-payment-actions.ts.
 * Replace with <CheckoutButton /> (already implemented, Razorpay test-mode
 * ready) before production.
 */

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { simulatePayment } from "@/app/purchase/dummy-payment-actions";

type Status = "idle" | "loading" | "success" | "failure";

export function DummyPaymentButtons({
  catalogItemId,
  tierLabel,
  disabled,
}: {
  catalogItemId: string;
  tierLabel: string;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [pendingOutcome, setPendingOutcome] = useState<"paid" | "not_paid" | null>(null);

  async function handleChoice(outcome: "paid" | "not_paid") {
    setStatus("loading");
    setPendingOutcome(outcome);

    const result = await simulatePayment(catalogItemId, tierLabel, outcome);

    if (result.error) {
      toast.error(result.error);
      setStatus("idle");
      return;
    }

    setStatus(outcome === "paid" ? "success" : "failure");
  }

  if (status === "success") {
    return (
      <div className="space-y-3 rounded-lg border border-primary/20 bg-red-50/50 p-4 text-center">
        <CheckCircle2 className="mx-auto size-8 text-primary" />
        <p className="text-sm font-medium">
          Payment successful — you now have access to update your products.
        </p>
        <p className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
          Product section integration (MongoDB) coming soon
        </p>
        <Link href="/dashboard" className="block">
          <Button variant="outline" className="w-full">
            Go to dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (status === "failure") {
    return (
      <div className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
        <XCircle className="mx-auto size-8 text-destructive" />
        <p className="text-sm font-medium">Payment not completed</p>
        <Button variant="outline" className="w-full" onClick={() => setStatus("idle")}>
          <RotateCcw className="size-4" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-muted-foreground">
        Test mode — simulate the payment outcome
      </p>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={disabled || status === "loading"}
          onClick={() => handleChoice("paid")}
        >
          {status === "loading" && pendingOutcome === "paid" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          Paid
        </Button>
        <Button
          className="flex-1"
          variant="outline"
          disabled={disabled || status === "loading"}
          onClick={() => handleChoice("not_paid")}
        >
          {status === "loading" && pendingOutcome === "not_paid" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <XCircle className="size-4" />
          )}
          Not Paid
        </Button>
      </div>
    </div>
  );
}
