import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ActivityLog, CatalogItem, Order } from "@/lib/supabase/types";

/**
 * Every query here is scoped by a brandId that the caller must have already
 * derived from the authenticated session (getCurrentBrand()) — never from a
 * client-supplied param. RLS on each table double-enforces that regardless:
 * a brand can only ever read rows where brands.user_id = auth.uid().
 */

export async function getRecentOrders(brandId: string, limit = 5): Promise<Order[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getRecentActivityForBrand(brandId: string, limit = 5): Promise<ActivityLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getSubscriptionCatalogItem(): Promise<CatalogItem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("type", "subscription")
    .eq("is_active", true)
    .maybeSingle();

  return data;
}

export async function getOrdersPage(
  brandId: string,
  page: number,
  pageSize: number
): Promise<{ rows: Order[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .range(from, to);

  return { rows: data ?? [], total: count ?? 0 };
}

export interface UsageTotals {
  qrPurchasedTotal: number;
  dynamicQrPurchasedTotal: number;
}

/** Sums successful orders by item_type — the denominator for the usage gauge. */
export async function getUsageTotals(brandId: string): Promise<UsageTotals> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("item_type, quantity")
    .eq("brand_id", brandId)
    .eq("payment_status", "success")
    .in("item_type", ["qr", "dynamic_qr"]);

  let qrPurchasedTotal = 0;
  let dynamicQrPurchasedTotal = 0;
  for (const row of data ?? []) {
    if (row.item_type === "qr") qrPurchasedTotal += row.quantity;
    else if (row.item_type === "dynamic_qr") dynamicQrPurchasedTotal += row.quantity;
  }
  return { qrPurchasedTotal, dynamicQrPurchasedTotal };
}
