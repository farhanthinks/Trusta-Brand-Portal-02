import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// TEMPORARY — see components/purchase/dummy-payment-buttons.tsx. Swap back to
// CheckoutButton (components/purchase/checkout-button.tsx — Razorpay
// test-mode, already implemented) before production.
import { DummyPaymentButtons } from "./dummy-payment-buttons";
import type { TierOption } from "@/lib/supabase/types";

export function OrderSummary({
  itemName,
  tier,
  catalogItemId,
  // Unused while DummyPaymentButtons is swapped in for testing — kept here
  // so CheckoutButton (which needs them for Razorpay prefill) can be
  // restored as a drop-in without touching call sites.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  brandName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contactNumber,
}: {
  itemName: string;
  tier: TierOption | null;
  catalogItemId: string;
  brandName?: string | null;
  contactNumber?: string | null;
}) {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="text-base">Order summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!tier ? (
          <p className="text-sm text-muted-foreground">Select an option to see your order summary.</p>
        ) : (
          <>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Item</span>
                <span className="text-right font-medium text-foreground">{itemName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tier</span>
                <span className="text-right font-medium text-foreground">{tier.label}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Quantity</span>
                <span className="font-medium text-foreground">{tier.quantity}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>₹{tier.price.toLocaleString("en-IN")}</span>
            </div>
            <DummyPaymentButtons catalogItemId={catalogItemId} tierLabel={tier.label} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
