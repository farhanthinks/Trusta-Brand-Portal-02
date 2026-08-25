"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getUserDetailAction } from "@/app/(admin)/admin/users/actions";
import { EVENT_META } from "@/components/admin/activity-event-meta";
import { formatDateTime } from "@/lib/format";
import type { UserListRow } from "@/lib/admin/queries";

export function UserDetailSheet({
  row,
  open,
  onOpenChange,
}: {
  row: UserListRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getUserDetailAction>> | null>(
    null
  );

  useEffect(() => {
    if (!open || !row) {
      setDetail(null);
      return;
    }
    setLoading(true);
    getUserDetailAction(row.brand_id)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [open, row]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto bg-white sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{row?.business_name ?? "User detail"}</SheetTitle>
          <SheetDescription>{row?.email}</SheetDescription>
        </SheetHeader>

        {loading || !detail ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 px-4 pb-8">
            <section>
              <h3 className="mb-2 text-sm font-semibold">Profile</h3>
              <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
                <dt className="text-muted-foreground">Business type</dt>
                <dd>{String(detail.brand?.business_type ?? "—")}</dd>
                <dt className="text-muted-foreground">GSTIN</dt>
                <dd>{String(detail.brand?.gstin ?? "—")}</dd>
                <dt className="text-muted-foreground">Contact</dt>
                <dd>{String(detail.brand?.contact_number ?? "—")}</dd>
                <dt className="text-muted-foreground">Location</dt>
                <dd>
                  {String(detail.brand?.city ?? "—")}, {String(detail.brand?.state ?? "—")}
                </dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant="secondary">{String(detail.brand?.status ?? "—")}</Badge>
                </dd>
              </dl>
            </section>

            <Separator />

            <section>
              <h3 className="mb-2 text-sm font-semibold">Verification documents</h3>
              {detail.verifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.verifications.map((v) => {
                    const path = v.document_url as string;
                    const url = detail.documentUrls[path];
                    return (
                      <li key={v.id as string}>
                        <a
                          href={url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                        >
                          <FileText className="size-4 shrink-0" />
                          <span className="flex-1">
                            {v.document_type === "business_proof" ? "Business proof" : "ID proof"}
                          </span>
                          <Badge variant="outline">{v.status as string}</Badge>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <Separator />

            <section>
              <h3 className="mb-2 text-sm font-semibold">
                Order history ({detail.orders.length})
              </h3>
              {detail.orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.orders.map((o) => (
                    <li
                      key={o.id as string}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="capitalize">{String(o.item_type).replace(/_/g, " ")}</span>
                      <span>&#8377;{Number(o.amount).toLocaleString("en-IN")}</span>
                      <Badge
                        variant={o.payment_status === "success" ? "default" : "secondary"}
                      >
                        {o.payment_status as string}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <Separator />

            <section>
              <h3 className="mb-2 text-sm font-semibold">Recent activity</h3>
              {detail.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded.</p>
              ) : (
                <ul className="space-y-2">
                  {detail.recentActivity.map((a) => {
                    const meta = EVENT_META[a.event_type as keyof typeof EVENT_META];
                    return (
                      <li key={a.id as string} className="flex items-center justify-between text-sm">
                        <span>{meta?.label ?? String(a.event_type)}</span>
                        <span className="text-muted-foreground">
                          {formatDateTime(a.created_at as string)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
