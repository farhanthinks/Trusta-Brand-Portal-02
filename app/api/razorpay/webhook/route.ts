import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillOrder, markOrderFailed } from "@/lib/orders/fulfill-order";

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity?: {
        id: string;
        order_id: string;
        notes?: { order_id?: string };
      };
    };
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const provider = getPaymentProvider();
  if (!provider.verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  const paymentEntity = payload.payload.payment?.entity;

  if (!paymentEntity) {
    return NextResponse.json({ received: true });
  }

  const orderId = paymentEntity.notes?.order_id ?? (await lookupOrderIdByRazorpayOrderId(paymentEntity.order_id));

  if (!orderId) {
    return NextResponse.json({ received: true });
  }

  if (payload.event === "payment.captured") {
    await fulfillOrder(orderId, paymentEntity.id);
  } else if (payload.event === "payment.failed") {
    await markOrderFailed(orderId);
  }

  return NextResponse.json({ received: true });
}

async function lookupOrderIdByRazorpayOrderId(razorpayOrderId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();
  return data?.id ?? null;
}
