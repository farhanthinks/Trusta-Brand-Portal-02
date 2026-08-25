import "server-only";
import Razorpay from "razorpay";
import crypto from "node:crypto";
import type {
  CreatePaymentOrderInput,
  CreatePaymentOrderResult,
  PaymentProvider,
  VerifyPaymentSignatureInput,
} from "./types";

function getClient() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export const razorpayProvider: PaymentProvider = {
  name: "razorpay",
  publicKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",

  async createOrder(
    input: CreatePaymentOrderInput
  ): Promise<CreatePaymentOrderResult> {
    const order = await getClient().orders.create({
      amount: input.amountInSubunits,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    });

    return {
      providerOrderId: order.id,
      amountInSubunits: Number(order.amount),
      currency: order.currency,
    };
  },

  verifyPaymentSignature(input: VerifyPaymentSignatureInput): boolean {
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${input.providerOrderId}|${input.providerPaymentId}`)
      .digest("hex");

    return timingSafeEqual(expected, input.signature);
  },

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    return timingSafeEqual(expected, signature);
  },
};

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
