import Link from "next/link";
import { Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BrandEntitlement } from "@/lib/supabase/types";
import type { UsageTotals } from "@/lib/dashboard/queries";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function UsageSummaryCard({
  entitlements,
  usage,
}: {
  entitlements: BrandEntitlement | null;
  usage: UsageTotals;
}) {
  const available = (entitlements?.qr_quota ?? 0) + (entitlements?.dynamic_qr_quota ?? 0);
  const purchasedTotal = usage.qrPurchasedTotal + usage.dynamicQrPurchasedTotal;
  // Nothing decrements quota yet (product/QR-generation isn't built), so
  // "used" is genuinely always 0 right now — not fabricated, just what the
  // data actually shows until that feature exists.
  const used = Math.max(0, purchasedTotal - available);
  const total = used + available;
  const usedPercent = total > 0 ? Math.round((used / total) * 100) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - (total > 0 ? used / total : 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="size-4 text-primary" />
          Usage Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">
            No QR credits yet — purchase a plan or QR pack to see usage here.
          </p>
        ) : (
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--muted)" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{usedPercent}%</span>
                <span className="text-[10px] text-muted-foreground">used</span>
              </div>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Used</span>
                <span className="font-medium">{used}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-muted" />
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium">{available}</span>
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                Usage tracking activates once you start using QR codes.
              </p>
            </div>
          </div>
        )}

        <Link
          href="/purchase"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          View usage details →
        </Link>
      </CardContent>
    </Card>
  );
}
