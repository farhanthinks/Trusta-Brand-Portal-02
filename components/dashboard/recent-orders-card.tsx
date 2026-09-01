import Link from "next/link";
import { Receipt, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentOrders } from "@/lib/dashboard/queries";
import { OrderRow } from "./order-row";

export async function RecentOrdersCard({ brandId }: { brandId: string }) {
  const orders = await getRecentOrders(brandId, 5);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="size-4 text-primary" />
          Recent Orders
        </CardTitle>
        {orders.length > 0 && (
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No orders yet — purchase QR credits or a subscription to see them here.
          </p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
