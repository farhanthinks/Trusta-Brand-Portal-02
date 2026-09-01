import Link from "next/link";
import { ChevronLeft, Receipt } from "lucide-react";
import { getCurrentBrand } from "@/lib/supabase/queries";
import { getOrdersPage } from "@/lib/dashboard/queries";
import { OrderRow } from "@/components/dashboard/order-row";
import { AdminPagination } from "@/components/admin/pagination";

const PAGE_SIZE = 20;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const brand = await getCurrentBrand();
  if (!brand) return null;

  const { rows, total } = await getOrdersPage(brand.id, page, PAGE_SIZE);

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <Receipt className="size-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Your Orders</h1>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No orders yet — purchase QR credits or a subscription to see them here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="space-y-2 p-4">
            {rows.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
          <AdminPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            basePath="/dashboard/orders"
            searchParams={params}
          />
        </div>
      )}
    </div>
  );
}
