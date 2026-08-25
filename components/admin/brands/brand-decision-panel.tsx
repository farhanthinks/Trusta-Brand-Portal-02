"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DecisionResult {
  error?: string;
  success?: boolean;
}

export function BrandDecisionPanel({
  approveLabel,
  rejectLabel,
  onApprove,
  onReject,
  onDone,
}: {
  approveLabel: string;
  rejectLabel: string;
  onApprove: (remarks: string | undefined) => Promise<DecisionResult>;
  onReject: (remarks: string | undefined) => Promise<DecisionResult>;
  onDone: () => void;
}) {
  const [remarks, setRemarks] = useState("");
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  function handle(kind: "approve" | "reject") {
    if (kind === "reject" && remarks.trim().length === 0) {
      toast.error("Add a remark explaining the rejection");
      return;
    }
    setAction(kind);
    startTransition(async () => {
      const result = kind === "approve" ? await onApprove(remarks || undefined) : await onReject(remarks);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(kind === "approve" ? approveLabel : rejectLabel);
      onDone();
    });
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="space-y-1.5">
        <Label htmlFor="remarks">Remarks (required to reject)</Label>
        <Textarea
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Optional note — required if you're rejecting..."
          rows={3}
          disabled={isPending}
        />
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => handle("approve")} disabled={isPending}>
          {isPending && action === "approve" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          {approveLabel}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => handle("reject")}
          disabled={isPending}
        >
          {isPending && action === "reject" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <X className="size-4" />
          )}
          {rejectLabel}
        </Button>
      </div>
    </div>
  );
}
