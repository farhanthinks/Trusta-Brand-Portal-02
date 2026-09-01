import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/format";
import type { Brand, BrandEntitlement, BrandStatus } from "@/lib/supabase/types";

const STATUS_STYLES: Record<BrandStatus, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  verification_pending: "bg-amber-100 text-amber-700",
  verified: "bg-blue-100 text-blue-700",
  profile_completed: "bg-secondary text-secondary-foreground",
  registered: "bg-secondary text-secondary-foreground",
};

function initialsFor(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function BrandProfileCard({
  brand,
  email,
  entitlements,
}: {
  brand: Brand;
  email: string | null;
  entitlements: BrandEntitlement | null;
}) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <div className="flex items-center gap-2.5">
        <Avatar className="size-9 shrink-0 border">
          {brand.logo_url && <AvatarImage src={brand.logo_url} alt={brand.business_name ?? ""} />}
          <AvatarFallback className="bg-red-50 text-xs font-semibold text-primary">
            {initialsFor(brand.business_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{brand.business_name ?? "Your brand"}</p>
          {email && <p className="truncate text-xs text-muted-foreground">{email}</p>}
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLES[brand.status]}`}
        >
          {brand.status.replace(/_/g, " ")}
        </span>
      </div>

      {entitlements?.subscription_plan && (
        <div className="mt-2 border-t pt-2 text-xs text-muted-foreground">
          <p className="truncate font-medium text-foreground">{entitlements.subscription_plan}</p>
          {entitlements.subscription_expires_at && (
            <p>Renews {formatDate(entitlements.subscription_expires_at)}</p>
          )}
        </div>
      )}
    </div>
  );
}
