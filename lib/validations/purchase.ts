import { z } from "zod";

export const createOrderSchema = z.object({
  catalog_item_id: z.string().uuid(),
  tier_label: z.string().min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const verifyPaymentSchema = z.object({
  order_id: z.string().uuid(),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
