import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { subscriptionExpiryFrom } from "./tiers";
import { logActivity } from "@/lib/admin/activity";
import type { OrderItemDetails } from "@/lib/supabase/types";

export interface FulfillResult {
  ok: boolean;
  error?: string;
}

/**
 * Marks an order as paid and applies its entitlements. Idempotent — safe to
 * call from both the client-side verification route and the Razorpay
 * webhook without double-crediting a brand.
 */
export async function fulfillOrder(orderId: string, paymentId: string): Promise<FulfillResult> {
  const admin = createAdminClient();

  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError) return { ok: false, error: fetchError.message };
  if (!order) return { ok: false, error: "Order not found" };
  if (order.payment_status === "success") return { ok: true };

  const { error: updateError } = await admin
    .from("orders")
    .update({ payment_status: "success", payment_id: paymentId })
    .eq("id", orderId);

  if (updateError) return { ok: false, error: updateError.message };

  const details = order.item_details as OrderItemDetails;
  const quantity = details.quantity ?? order.quantity ?? 0;

  if (order.item_type === "qr" || order.item_type === "dynamic_qr") {
    const field = order.item_type === "qr" ? "qr_quota" : "dynamic_qr_quota";
    await incrementQuota(admin, order.brand_id, field, quantity);
  } else if (order.item_type === "subscription") {
    await admin.from("brand_entitlements").upsert(
      {
        brand_id: order.brand_id,
        subscription_plan: details.tier_label ?? order.item_details?.tier_label ?? "Subscription",
        subscription_expires_at: subscriptionExpiryFrom(details.billing_cycle),
      },
      { onConflict: "brand_id" }
    );
  }
  // 'other' items don't affect QR/subscription quotas.

  const { data: brand } = await admin
    .from("brands")
    .select("user_id")
    .eq("id", order.brand_id)
    .maybeSingle();

  if (brand?.user_id) {
    await logActivity(brand.user_id, "purchase", {
      order_id: order.id,
      item_type: order.item_type,
      amount: order.amount,
    });
  }

  return { ok: true };
}

export async function markOrderFailed(orderId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({ payment_status: "failed" })
    .eq("id", orderId)
    .eq("payment_status", "pending");
}

async function incrementQuota(
  admin: ReturnType<typeof createAdminClient>,
  brandId: string,
  field: "qr_quota" | "dynamic_qr_quota",
  amount: number
) {
  const { data: existing } = await admin
    .from("brand_entitlements")
    .select("*")
    .eq("brand_id", brandId)
    .maybeSingle();

  const newValue = (existing?.[field] ?? 0) + amount;

  await admin
    .from("brand_entitlements")
    .upsert({ brand_id: brandId, [field]: newValue }, { onConflict: "brand_id" });
}
