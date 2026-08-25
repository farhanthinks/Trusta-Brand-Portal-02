"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CatalogItem, TierOption } from "@/lib/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderSummary } from "./order-summary";

interface Selection {
  catalogItemId: string;
  itemName: string;
  tier: TierOption;
}

export function PurchaseFlow({
  items,
  brandName,
  contactNumber,
}: {
  items: CatalogItem[];
  brandName?: string | null;
  contactNumber?: string | null;
}) {
  const [selection, setSelection] = useState<Selection | null>(null);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {items.map((item) => {
          const hasTiers = item.tier_options && item.tier_options.length > 0;

          return (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-base">{item.name}</CardTitle>
                {item.description && <CardDescription>{item.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                {hasTiers ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {item.tier_options!.map((tier) => {
                      const isSelected =
                        selection?.catalogItemId === item.id && selection.tier.label === tier.label;
                      return (
                        <motion.button
                          key={tier.label}
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() =>
                            setSelection({ catalogItemId: item.id, itemName: item.name, tier })
                          }
                          className={cn(
                            "relative rounded-lg border p-4 text-left transition-colors",
                            isSelected
                              ? "border-primary bg-red-50/60 ring-1 ring-primary"
                              : "hover:border-primary/40 hover:bg-muted/40"
                          )}
                        >
                          {isSelected && (
                            <Check className="absolute right-2 top-2 size-4 text-primary" />
                          )}
                          <p className="text-sm font-medium">{tier.label}</p>
                          <p className="mt-1 text-lg font-semibold">
                            ₹{tier.price.toLocaleString("en-IN")}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setSelection({
                        catalogItemId: item.id,
                        itemName: item.name,
                        tier: { label: item.name, quantity: 1, price: Number(item.price) },
                      })
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors",
                      selection?.catalogItemId === item.id
                        ? "border-primary bg-red-50/60 ring-1 ring-primary"
                        : "hover:border-primary/40 hover:bg-muted/40"
                    )}
                  >
                    <span className="text-sm font-medium">One-time purchase</span>
                    <span className="text-lg font-semibold">
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </span>
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <OrderSummary
          itemName={selection?.itemName ?? ""}
          tier={selection?.tier ?? null}
          catalogItemId={selection?.catalogItemId ?? ""}
          brandName={brandName}
          contactNumber={contactNumber}
        />
      </div>
    </div>
  );
}
