import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payments";
import { verifyPaymentSchema } from "@/lib/validations/purchase";
import { fulfillOrder, markOrderFailed } from "@/lib/orders/fulfill-order";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // RLS scopes this select to orders owned by the caller's brand.
  const { data: order } = await supabase
    .from("orders")
    .select("id, razorpay_order_id")
    .eq("id", parsed.data.order_id)
    .maybeSingle();

  if (!order || order.razorpay_order_id !== parsed.data.razorpay_order_id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const provider = getPaymentProvider();
  const isValid = provider.verifyPaymentSignature({
    providerOrderId: parsed.data.razorpay_order_id,
    providerPaymentId: parsed.data.razorpay_payment_id,
    signature: parsed.data.razorpay_signature,
  });

  if (!isValid) {
    await markOrderFailed(parsed.data.order_id);
    return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
  }

  const result = await fulfillOrder(parsed.data.order_id, parsed.data.razorpay_payment_id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, order_id: parsed.data.order_id });
}
