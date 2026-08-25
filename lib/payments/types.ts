export interface CreatePaymentOrderInput {
  /** Smallest currency unit, e.g. paise for INR. */
  amountInSubunits: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface CreatePaymentOrderResult {
  providerOrderId: string;
  amountInSubunits: number;
  currency: string;
}

export interface VerifyPaymentSignatureInput {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface PaymentProvider {
  name: string;
  /** Public key/config the client-side checkout widget needs. */
  publicKeyId: string;
  createOrder(input: CreatePaymentOrderInput): Promise<CreatePaymentOrderResult>;
  verifyPaymentSignature(input: VerifyPaymentSignatureInput): boolean;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}
