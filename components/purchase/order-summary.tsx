import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckoutButton } from "./checkout-button";
import type { TierOption } from "@/lib/supabase/types";

export function OrderSummary({
  itemName,
  tier,
  catalogItemId,
  brandName,
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
            <CheckoutButton
              catalogItemId={catalogItemId}
              tierLabel={tier.label}
              brandName={brandName}
              contactNumber={contactNumber}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
