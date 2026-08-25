import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentBrand } from "@/lib/supabase/queries";
import { PurchaseFlow } from "@/components/purchase/purchase-flow";
import type { CatalogItemType } from "@/lib/supabase/types";

const VALID_TYPES: CatalogItemType[] = ["qr", "dynamic_qr", "subscription", "other"];

const TITLES: Record<CatalogItemType, string> = {
  qr: "Static QR Codes",
  dynamic_qr: "Dynamic QR Codes",
  subscription: "Subscription Plans",
  other: "Other Services",
};

export default async function PurchaseTypePage({
  params,
}: {
  params: { type: string };
}) {
  if (!VALID_TYPES.includes(params.type as CatalogItemType)) {
    notFound();
  }
  const type = params.type as CatalogItemType;

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("type", type)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (!items || items.length === 0) {
    notFound();
  }

  const brand = await getCurrentBrand();

  return (
    <div>
      <Link
        href="/purchase"
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to purchase
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">{TITLES[type]}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {type === "subscription"
          ? "Choose a plan that bundles QR credits with platform features."
          : "Choose the tier that fits your business."}
      </p>

      <div className="mt-8">
        <PurchaseFlow
          items={items}
          brandName={brand?.business_name}
          contactNumber={brand?.contact_number}
        />
      </div>
    </div>
  );
}
