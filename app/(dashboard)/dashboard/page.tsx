import Link from "next/link";
import { QrCode, ArrowRight } from "lucide-react";

import { getCurrentBrand, getBrandEntitlements } from "@/lib/supabase/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const brand = await getCurrentBrand();
  const entitlements = brand ? await getBrandEntitlements(brand.id) : null;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-red-50 to-white">
        <CardContent className="flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Welcome back</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {brand?.business_name ?? "Your brand"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account is approved and ready to go.
            </p>
          </div>
          <Link href="/purchase">
            <Button size="lg">
              <QrCode className="mr-2 size-4" />
              Purchase QR / Subscription
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Static QR credits" value={entitlements?.qr_quota ?? 0} />
        <StatCard label="Dynamic QR credits" value={entitlements?.dynamic_qr_quota ?? 0} />
        <StatCard
          label="Subscription plan"
          value={entitlements?.subscription_plan ?? "None"}
          isText
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            Product catalog management is coming soon. For now, purchase QR
            credits or a subscription plan to get ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            No products yet — this space will show your product catalog.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  isText = false,
}: {
  label: string;
  value: string | number;
  isText?: boolean;
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 font-semibold ${isText ? "text-lg" : "text-2xl"}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
