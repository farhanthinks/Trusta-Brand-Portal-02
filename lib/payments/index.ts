import "server-only";
import type { PaymentProvider } from "./types";
import { razorpayProvider } from "./razorpay";

/**
 * Single swap point for the payment gateway. Every call site imports
 * `getPaymentProvider()` rather than the Razorpay SDK directly, so switching
 * providers later only means implementing `PaymentProvider` and changing
 * the import here.
 */
export function getPaymentProvider(): PaymentProvider {
  return razorpayProvider;
}

export type { PaymentProvider } from "./types";
