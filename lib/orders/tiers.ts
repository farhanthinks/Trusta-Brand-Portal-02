import type { CatalogItem, TierOption } from "@/lib/supabase/types";

export function resolveTier(item: CatalogItem, tierLabel: string): TierOption | null {
  if (item.tier_options && item.tier_options.length > 0) {
    return item.tier_options.find((t) => t.label === tierLabel) ?? null;
  }
  if (item.price != null) {
    return { label: item.name, quantity: 1, price: Number(item.price) };
  }
  return null;
}

export function billingCycleFromLabel(label: string): "monthly" | "yearly" | undefined {
  if (/yearly/i.test(label)) return "yearly";
  if (/monthly/i.test(label)) return "monthly";
  return undefined;
}

export function subscriptionExpiryFrom(billingCycle: "monthly" | "yearly" | undefined): string {
  const now = new Date();
  if (billingCycle === "yearly") {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString();
}
