import Link from "next/link";
import { Sparkles, ArrowRight, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { BrandEntitlement } from "@/lib/supabase/types";

export function YourPlanCard({ entitlements }: { entitlements: BrandEntitlement | null }) {
  const planName = entitlements?.subscription_plan ?? null;
  const expiresAt = entitlements?.subscription_expires_at ?? null;
  const isActive = Boolean(planName && expiresAt && new Date(expiresAt) > new Date());
  const isExpired = Boolean(planName && expiresAt && new Date(expiresAt) <= new Date());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" />
          Your plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!planName ? (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">No active plan</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Subscribe to a plan to bundle QR credits with platform features.
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
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{planName}</p>
                {isActive && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    Active
                  </Badge>
                )}
                {isExpired && <Badge variant="destructive">Expired</Badge>}
              </div>
              {expiresAt && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarClock className="size-3.5" />
                  {isActive ? "Renews on" : "Expired on"} {formatDate(expiresAt)}
                </p>
              )}
            </div>
            <Link href="/purchase/subscription">
              <Button variant="outline">
                {isExpired ? "Renew plan" : "Change plan"}
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
