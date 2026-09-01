import Link from "next/link";
import { Sparkles, ArrowRight, CalendarClock, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { BrandEntitlement, CatalogItem } from "@/lib/supabase/types";

export function YourPlanCard({
  entitlements,
  catalogItem,
}: {
  entitlements: BrandEntitlement | null;
  catalogItem: CatalogItem | null;
}) {
  const planName = entitlements?.subscription_plan ?? null;
  const expiresAt = entitlements?.subscription_expires_at ?? null;
  const isActive = Boolean(planName && expiresAt && new Date(expiresAt) > new Date());
  const isExpired = Boolean(planName && expiresAt && new Date(expiresAt) <= new Date());

  // The matching tier's price, if the catalog still lists it — real data,
  // never a hardcoded number.
  const tier = catalogItem?.tier_options?.find((t) => t.label === planName) ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" />
          Your Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!planName ? (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">No active plan</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {catalogItem?.description ??
                  "Subscribe to a plan to bundle QR credits with platform features."}
              </p>
            </div>
            <Link href="/purchase/subscription">
              <Button variant="outline">
                View plans
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{planName}</p>
                {isActive && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    Active
                  </Badge>
                )}
                {isExpired && <Badge variant="destructive">Expired</Badge>}
              </div>

              {catalogItem?.description && (
                <p className="mt-1.5 text-sm text-muted-foreground">{catalogItem.description}</p>
              )}

              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {tier && (
                  <li className="flex items-center gap-1.5">
                    <IndianRupee className="size-3.5 shrink-0" />
                    {tier.price.toLocaleString("en-IN")} per billing cycle
                  </li>
                )}
                {expiresAt && (
                  <li className="flex items-center gap-1.5">
                    <CalendarClock className="size-3.5 shrink-0" />
                    {isActive ? "Renews on" : "Expired on"} {formatDate(expiresAt)}
                  </li>
                )}
              </ul>
            </div>
            <Link href="/purchase/subscription" className="shrink-0">
              <Button variant="outline">
                {isExpired ? "Renew plan" : "Change Plan"}
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
