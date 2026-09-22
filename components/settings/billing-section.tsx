import Link from "next/link";
import { CreditCard, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { YourPlanCard } from "@/components/dashboard/your-plan-card";
import { OrderRow } from "@/components/dashboard/order-row";
import type { BrandEntitlement, CatalogItem, Order } from "@/lib/supabase/types";

export function BillingSection({
  entitlements,
  subscriptionCatalogItem,
  orders,
  ordersTotal,
}: {
  entitlements: BrandEntitlement | null;
  subscriptionCatalogItem: CatalogItem | null;
  orders: Order[];
  ordersTotal: number;
}) {
  return (
    <div className="space-y-6">
      <YourPlanCard entitlements={entitlements} catalogItem={subscriptionCatalogItem} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            Payment History
          </CardTitle>
          <CardDescription>
            Every order and its receipt reference — this doubles as your invoice record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </CardContent>
        {ordersTotal > orders.length && (
          <CardFooter className="justify-end">
            <Link href="/dashboard/orders">
              <Button variant="outline" size="sm">
                View all orders
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
