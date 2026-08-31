"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  CATEGORY_LABEL,
  CATEGORY_STYLES,
  EVENT_META,
  getEventLabel,
} from "@/components/admin/activity-event-meta";
import { formatDateTime, maskIp } from "@/lib/format";
import type { BrandActivityLogRow } from "@/lib/admin/queries";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-words">{value}</dd>
    </div>
  );
}

export function ActivityEventDetails({
  row,
  userEmail,
  open,
  onOpenChange,
}: {
  row: BrandActivityLogRow | null;
  userEmail: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!row) return null;

  const meta = EVENT_META[row.event_type];
  const Icon = meta.icon;
  const userAgent = typeof row.metadata.user_agent === "string" ? row.metadata.user_agent : null;
  const metadataWithoutUserAgent = Object.fromEntries(
    Object.entries(row.metadata).filter(([k]) => k !== "user_agent")
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`size-5 ${meta.color}`} />
            {getEventLabel(row.event_type, row.metadata)}
          </DialogTitle>
          <DialogDescription>Full event details for this activity log entry.</DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-4">
          <Field label="Date" value={formatDateTime(row.created_at)} />
          <Field label="Category" value={
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLES[meta.category]}`}>
              {CATEGORY_LABEL[meta.category]}
            </span>
          } />
          <Field label="User" value={userEmail ?? "—"} />
          <Field label="Role" value="Brand" />
          <Field label="Source" value="Web" />
          <Field label="IP address" value={maskIp(row.ip_address)} />
        </dl>

        {userAgent && (
          <>
            <Separator />
            <Field label="User agent" value={userAgent} />
          </>
        )}

        <Separator />

        <div>
          <p className="mb-1.5 text-xs text-muted-foreground">Metadata</p>
          {Object.keys(metadataWithoutUserAgent).length === 0 ? (
            <p className="text-sm text-muted-foreground">No additional metadata.</p>
          ) : (
            <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs">
              {JSON.stringify(metadataWithoutUserAgent, null, 2)}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
