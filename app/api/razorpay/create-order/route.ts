import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payments";
import { createOrderSchema } from "@/lib/validations/purchase";
import { resolveTier, billingCycleFromLabel } from "@/lib/orders/tiers";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!brand || brand.status !== "approved") {
    return NextResponse.json({ error: "Brand is not approved" }, { status: 403 });
  }

  const { data: catalogItem } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("id", parsed.data.catalog_item_id)
    .eq("is_active", true)
    .maybeSingle();

  if (!catalogItem) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const tier = resolveTier(catalogItem, parsed.data.tier_label);
  if (!tier) {
    return NextResponse.json({ error: "Invalid tier selected" }, { status: 400 });
  }

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
      payment_provider: "razorpay",
      payment_status: "pending",
    })
    .select("*")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "Could not create order" }, { status: 500 });
  }

  const provider = getPaymentProvider();

  try {
    const providerOrder = await provider.createOrder({
      amountInSubunits: Math.round(tier.price * 100),
      currency: "INR",
      receipt: order.id,
      notes: { order_id: order.id, brand_id: brand.id },
    });

    const admin = createAdminClient();
    await admin
      .from("orders")
      .update({ razorpay_order_id: providerOrder.providerOrderId })
      .eq("id", order.id);

    return NextResponse.json({
      order_id: order.id,
      razorpay_order_id: providerOrder.providerOrderId,
      amount: providerOrder.amountInSubunits,
      currency: providerOrder.currency,
      key_id: provider.publicKeyId,
      brand_name: brand.business_name,
      contact_number: brand.contact_number,
    });
  } catch (err) {
    await markOrderFailedOnCreateError(order.id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment gateway error" },
      { status: 502 }
    );
  }
}

async function markOrderFailedOnCreateError(orderId: string) {
  const admin = createAdminClient();
  await admin.from("orders").update({ payment_status: "failed" }).eq("id", orderId);
}
