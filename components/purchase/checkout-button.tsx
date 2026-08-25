"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

interface CheckoutButtonProps {
  catalogItemId: string;
  tierLabel: string;
  disabled?: boolean;
  brandName?: string | null;
  contactNumber?: string | null;
}

export function CheckoutButton({
  catalogItemId,
  tierLabel,
  disabled,
  brandName,
  contactNumber,
}: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const createRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalog_item_id: catalogItemId, tier_label: tierLabel }),
      });
      const createData = await createRes.json();

      if (!createRes.ok) {
        toast.error(createData.error ?? "Could not start checkout");
        setLoading(false);
        return;
      }

      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment gateway is still loading, try again in a moment");
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: createData.key_id,
        amount: createData.amount,
        currency: createData.currency,
        order_id: createData.razorpay_order_id,
        name: "Trusta",
        description: tierLabel,
        prefill: {
          name: brandName ?? undefined,
          contact: contactNumber ?? undefined,
        },
        theme: { color: "#DC2626" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: createData.order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            router.push(`/purchase/success?order_id=${createData.order_id}`);
          } else {
            router.push(`/purchase/failed?order_id=${createData.order_id}`);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            router.push(`/purchase/failed?order_id=${createData.order_id}`);
          },
        },
      });

      razorpay.open();
      setLoading(false);
    } catch {
      toast.error("Something went wrong starting checkout");
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={disabled || loading} size="lg" className="w-full">
      {loading ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 size-4" />
      )}
      {loading ? "Starting checkout..." : "Proceed to payment"}
    </Button>
  );
}
