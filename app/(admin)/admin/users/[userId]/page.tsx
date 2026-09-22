import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { getUserDetailAction } from "../actions";
import { UserDetailActions } from "@/components/admin/users/user-detail-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EVENT_META } from "@/components/admin/activity-event-meta";
import { formatDate, formatDateTime } from "@/lib/format";

function initialsFor(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function CreditBlock({
  label,
  purchased,
  used,
  remaining,
}: {
  label: string;
  purchased: number;
  used: number;
  remaining: number;
}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <dl className="space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Purchased</dt>
          <dd className="font-medium">{purchased}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Used</dt>
          <dd className="font-medium">{used}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Remaining</dt>
          <dd className="font-medium text-primary">{remaining}</dd>
        </div>
      </dl>
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const detail = await getUserDetailAction(userId);

  if (!detail.brand) notFound();

  const brand = detail.brand;
  const profile = detail.profile;
  const businessName = (brand.business_name as string | null) ?? null;
  const email = (profile?.email as string | null) ?? null;
  const isAdmin = Boolean(profile?.is_admin);
  const isSuspended = Boolean(profile?.is_suspended);

  const entitlements = detail.entitlements;
  const planName = entitlements?.subscription_plan ?? null;
  const planExpiresAt = entitlements?.subscription_expires_at ?? null;
  const isPlanActive = Boolean(planName && planExpiresAt && new Date(planExpiresAt) > new Date());
  const isPlanExpired = Boolean(planName && planExpiresAt && new Date(planExpiresAt) <= new Date());

  let qrPurchased = 0;
  let dynamicQrPurchased = 0;
  for (const o of detail.orders) {
    if (o.payment_status !== "success") continue;
    if (o.item_type === "qr") qrPurchased += o.quantity;
    else if (o.item_type === "dynamic_qr") dynamicQrPurchased += o.quantity;
  }
  const qrRemaining = entitlements?.qr_quota ?? 0;
  const dynamicQrRemaining = entitlements?.dynamic_qr_quota ?? 0;
  // Nothing decrements quota on use yet (QR-generation isn't built), so
  // "used" is genuinely always 0 right now — same convention as the
  // brand-facing Usage Summary card, not fabricated.
  const qrUsed = Math.max(0, qrPurchased - qrRemaining);
  const dynamicQrUsed = Math.max(0, dynamicQrPurchased - dynamicQrRemaining);

  return (
    <div>
      <Link
        href="/admin/users"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Users
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 border">
            {(brand.logo_url as string | null) && (
              <AvatarImage src={brand.logo_url as string} alt={businessName ?? ""} />
            )}
            <AvatarFallback className="bg-red-50 text-lg font-semibold text-primary">
              {initialsFor(businessName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">
                {businessName ?? "Unnamed business"}
              </h1>
              {isAdmin && <Badge variant="outline">admin</Badge>}
              {isSuspended && <Badge variant="destructive">suspended</Badge>}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{email ?? "—"}</p>
          </div>
        </div>

        <UserDetailActions
          userId={userId}
          businessName={businessName}
          isAdmin={isAdmin}
          isSuspended={isSuspended}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Profile</h3>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Business type</dt>
              <dd>{(brand.business_type as string | null) ?? "—"}</dd>
              <dt className="text-muted-foreground">GSTIN</dt>
              <dd>{(brand.gstin as string | null) ?? "—"}</dd>
              <dt className="text-muted-foreground">Contact</dt>
              <dd>{(brand.contact_number as string | null) ?? "—"}</dd>
              <dt className="text-muted-foreground">Location</dt>
              <dd>
                {(brand.city as string | null) ?? "—"}, {(brand.state as string | null) ?? "—"}
              </dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge variant="secondary">{(brand.status as string | null) ?? "—"}</Badge>
              </dd>
              <dt className="text-muted-foreground">Joined</dt>
              <dd>{formatDate(brand.created_at as string)}</dd>
            </dl>
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Verification documents</h3>
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
        </div>

        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Brand Purchase &amp; Entitlement Info</h3>

            <div className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{planName ?? "No active plan"}</p>
                {isPlanActive && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    Active
                  </Badge>
                )}
                {isPlanExpired && <Badge variant="destructive">Expired</Badge>}
              </div>
              {planExpiresAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {isPlanActive ? "Renews on" : "Expired on"} {formatDate(planExpiresAt)}
                </p>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CreditBlock
                label="QR Codes"
                purchased={qrPurchased}
                used={qrUsed}
                remaining={qrRemaining}
              />
              <CreditBlock
                label="Dynamic QR Codes"
                purchased={dynamicQrPurchased}
                used={dynamicQrUsed}
                remaining={dynamicQrRemaining}
              />
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">
              Purchase history ({detail.orders.length})
            </h3>
            {detail.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="space-y-2">
                {detail.orders.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="capitalize">{o.item_type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.quantity > 1 ? `${o.quantity}× · ` : ""}
                        {formatDateTime(o.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span>&#8377;{Number(o.amount).toLocaleString("en-IN")}</span>
                      <Badge variant={o.payment_status === "success" ? "default" : "secondary"}>
                        {o.payment_status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold">Recent activity</h3>
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
      </div>
    </div>
  );
}
