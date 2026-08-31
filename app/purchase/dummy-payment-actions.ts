"use server";

/**
 * ============================================================================
 * TEMPORARY — TESTING ONLY.
 *
 * This simulates a Razorpay payment outcome without ever calling Razorpay,
 * so the purchase flow can be exercised end-to-end before real payment
 * credentials are wired up. It reuses the exact same order-creation shape as
 * app/api/razorpay/create-order/route.ts and the same fulfillOrder/
 * markOrderFailed helpers the real webhook/verify routes use — only the
 * "call Razorpay and open the checkout modal" step is skipped.
 *
 * DELETE THIS FILE (and components/purchase/dummy-payment-buttons.tsx) and
 * restore <CheckoutButton /> in components/purchase/order-summary.tsx before
 * going to production.
 * ============================================================================
 */

import { createClient } from "@/lib/supabase/server";
import { createOrderSchema } from "@/lib/validations/purchase";
import { resolveTier, billingCycleFromLabel } from "@/lib/orders/tiers";
import { fulfillOrder, markOrderFailed } from "@/lib/orders/fulfill-order";

export interface SimulatePaymentResult {
  error?: string;
  success?: boolean;
  orderId?: string;
}

export async function simulatePayment(
  catalogItemId: string,
  tierLabel: string,
  outcome: "paid" | "not_paid"
): Promise<SimulatePaymentResult> {
  const parsed = createOrderSchema.safeParse({
    catalog_item_id: catalogItemId,
    tier_label: tierLabel,
  });
  if (!parsed.success) {
    return { error: "Invalid request" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!brand || brand.status !== "approved") {
    return { error: "Brand is not approved" };
  }

  const { data: catalogItem } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("id", parsed.data.catalog_item_id)
    .eq("is_active", true)
    .maybeSingle();
  if (!catalogItem) return { error: "Item not found" };

  const tier = resolveTier(catalogItem, parsed.data.tier_label);
  if (!tier) return { error: "Invalid tier selected" };

  const itemDetails = {
    tier_label: tier.label,
    quantity: tier.quantity,
    unit_price: tier.price,
    ...(catalogItem.type === "subscription"
      ? { billing_cycle: billingCycleFromLabel(tier.label) }
      : {}),
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      brand_id: brand.id,
      catalog_item_id: catalogItem.id,
      item_type: catalogItem.type,
      item_details: itemDetails,
      quantity: tier.quantity,
      amount: tier.price,
      currency: "INR",
      payment_provider: "dummy_test", // clearly distinguishable from real "razorpay" orders
      payment_status: "pending",
    })
    .select("*")
    .single();

  if (orderError || !order) {
    return { error: orderError?.message ?? "Could not create order" };
  }

  if (outcome === "paid") {
    const result = await fulfillOrder(order.id, `dummy_${order.id}`);
    if (!result.ok) return { error: result.error };
    return { success: true, orderId: order.id };
  }

  await markOrderFailed(order.id);
  return { success: false, orderId: order.id };
}
