import { QrCode, ScanLine, Layers, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CatalogCard } from "@/components/purchase/catalog-card";
import type { CatalogItem, CatalogItemType } from "@/lib/supabase/types";

function cheapestPrice(items: CatalogItem[]): number | null {
  let min: number | null = null;
  for (const item of items) {
    const prices = item.tier_options?.map((t) => t.price) ?? (item.price != null ? [Number(item.price)] : []);
    for (const p of prices) {
      if (min === null || p < min) min = p;
    }
  }
  return min;
}

export default async function PurchasePage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("catalog_items")
    .select("*")
    .eq("is_active", true);

  const byType = (type: CatalogItemType) => (items ?? []).filter((i) => i.type === type);

  const cards: Array<{
    type: CatalogItemType;
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
  }> = [
    {
      type: "qr",
      href: "/purchase/qr",
      icon: <QrCode className="size-5" />,
      title: "Static QR Codes",
      description: "Fixed-content QR codes for packaging and print.",
    },
    {
      type: "dynamic_qr",
      href: "/purchase/dynamic_qr",
      icon: <ScanLine className="size-5" />,
      title: "Dynamic QR Codes",
      description: "Editable destinations with scan analytics.",
    },
    {
      type: "subscription",
      href: "/purchase/subscription",
      icon: <Layers className="size-5" />,
      title: "Subscription Plans",
      description: "Monthly or yearly plans bundling QR credits & features.",
    },
    {
      type: "other",
      href: "/purchase/other",
      icon: <Sparkles className="size-5" />,
      title: "Other Services",
      description: "Design, support and other one-off services.",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Purchase QR / Subscription</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose what you need — pay securely via Razorpay.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const price = cheapestPrice(byType(card.type));
          return (
            <CatalogCard
              key={card.type}
              href={card.href}
              icon={card.icon}
              title={card.title}
              description={card.description}
              priceHint={price ? `From ₹${price.toLocaleString("en-IN")}` : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
