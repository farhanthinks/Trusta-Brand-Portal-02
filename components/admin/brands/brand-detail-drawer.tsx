"use client";

import { FileText } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BrandDecisionPanel } from "./brand-decision-panel";
import type { Brand, BrandVerification } from "@/lib/supabase/types";

export interface QueueEntry {
  brand: Brand;
  docs: (BrandVerification & { url: string })[];
}

export function BrandDetailDrawer({
  entry,
  open,
  onOpenChange,
  mode,
  onReviewVerification,
  onReviewApproval,
}: {
  entry: QueueEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "verification" | "approval";
  onReviewVerification: (
    brandId: string,
    decision: "verified" | "rejected",
    remarks: string | undefined
  ) => Promise<{ error?: string; success?: boolean }>;
  onReviewApproval: (
    brandId: string,
    decision: "approved" | "rejected",
    remarks: string | undefined
  ) => Promise<{ error?: string; success?: boolean }>;
}) {
  const brand = entry?.brand;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-white sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{brand?.business_name ?? "Brand detail"}</SheetTitle>
          <SheetDescription>{brand?.business_type}</SheetDescription>
        </SheetHeader>

        {brand && entry && (
          <div className="space-y-6 px-4 pb-8">
            <section>
              <h3 className="mb-2 text-sm font-semibold">Business details</h3>
              <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
                <dt className="text-muted-foreground">GSTIN</dt>
                <dd>{brand.gstin ?? "—"}</dd>
                <dt className="text-muted-foreground">Contact</dt>
                <dd>{brand.contact_number ?? "—"}</dd>
                <dt className="text-muted-foreground">Location</dt>
                <dd>
                  {brand.city ?? "—"}, {brand.state ?? "—"} {brand.pincode}
                </dd>
                <dt className="text-muted-foreground">Address</dt>
                <dd className="truncate">{brand.address ?? "—"}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant="secondary">{brand.status.replace(/_/g, " ")}</Badge>
                </dd>
              </dl>
            </section>

            <Separator />

            <section>
              <h3 className="mb-2 text-sm font-semibold">Documents</h3>
              {entry.docs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              ) : (
                <ul className="space-y-2">
                  {entry.docs.map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                      >
                        <FileText className="size-4 shrink-0" />
                        <span className="flex-1">
                          {doc.document_type === "business_proof" ? "Business proof" : "ID proof"}
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {doc.status}
                        </Badge>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {mode === "verification" ? (
              <BrandDecisionPanel
                approveLabel="Verify documents"
                rejectLabel="Reject documents"
                onApprove={(remarks) => onReviewVerification(brand.id, "verified", remarks)}
                onReject={(remarks) => onReviewVerification(brand.id, "rejected", remarks)}
                onDone={() => onOpenChange(false)}
              />
            ) : (
              <BrandDecisionPanel
                approveLabel="Approve brand"
                rejectLabel="Reject brand"
                onApprove={(remarks) => onReviewApproval(brand.id, "approved", remarks)}
                onReject={(remarks) => onReviewApproval(brand.id, "rejected", remarks)}
                onDone={() => onOpenChange(false)}
              />
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
