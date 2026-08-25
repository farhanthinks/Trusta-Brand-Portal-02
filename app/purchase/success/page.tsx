import Link from "next/link";
import { PartyPopper } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OrderItemDetails } from "@/lib/supabase/types";

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const supabase = await createClient();
  const { data: order } = searchParams.order_id
    ? await supabase.from("orders").select("*").eq("id", searchParams.order_id).maybeSingle()
    : { data: null };

  const details = (order?.item_details ?? {}) as OrderItemDetails;

  return (
    <div className="mx-auto max-w-lg py-10">
      <Card className="border-primary/20">
        <CardHeader className="items-center text-center">
          <PartyPopper className="mb-2 size-10 text-primary" />
          <CardTitle>Payment successful</CardTitle>
          <CardDescription>Your order has been confirmed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {order && (
            <>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tier</span>
                  <span className="font-medium text-foreground">{details.tier_label ?? "—"}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Amount paid</span>
                  <span className="font-medium text-foreground">
                    ₹{Number(order.amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-primary">
                {entitlementSummary(order.item_type, details)}
              </div>
            </>
          )}
          <Link href="/dashboard">
            <Button className="w-full">Go to dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function entitlementSummary(itemType: string, details: OrderItemDetails): string {
  if (itemType === "qr") return `${details.quantity ?? 0} static QR credits added`;
  if (itemType === "dynamic_qr") return `${details.quantity ?? 0} dynamic QR credits added`;
  if (itemType === "subscription") return `${details.tier_label ?? "Subscription"} plan activated`;
  return "Service purchase confirmed";
}
