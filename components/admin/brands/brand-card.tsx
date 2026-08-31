"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ListItemCard } from "@/components/admin/list-item-card";
import { formatDateTime } from "@/lib/format";
import type { Brand } from "@/lib/supabase/types";

const STATUS_META: Record<string, { label: string; className: string }> = {
  verification_pending: {
    label: "Verification pending",
    className: "bg-amber-100 text-amber-700",
  },
  verified: {
    label: "Awaiting approval",
    className: "bg-blue-100 text-blue-700",
  },
};

function initialsFor(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function BrandCard({
  brand,
  docCount,
  dateLabel,
  onClick,
}: {
  brand: Brand;
  docCount: number;
  dateLabel: string;
  onClick: () => void;
}) {
  const status = STATUS_META[brand.status] ?? { label: brand.status, className: "bg-secondary" };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <ListItemCard
        onClick={onClick}
        avatar={
          <Avatar className="size-12 shrink-0 border">
            {brand.logo_url && <AvatarImage src={brand.logo_url} alt={brand.business_name ?? ""} />}
            <AvatarFallback className="bg-red-50 text-sm font-semibold text-primary">
              {initialsFor(brand.business_name)}
            </AvatarFallback>
          </Avatar>
        }
        title={brand.business_name ?? "Unnamed business"}
        subtitle={brand.contact_number ?? undefined}
        meta={[
          ...(brand.business_type ? [{ icon: Building2, label: brand.business_type }] : []),
          ...(brand.city || brand.state
            ? [{ icon: MapPin, label: [brand.city, brand.state].filter(Boolean).join(", ") }]
            : []),
        ]}
        badge={
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {status.label}
          </span>
        }
        trailing={
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {docCount > 0 ? (
              <>
                <FileText className="size-3" />
                {docCount} document{docCount === 1 ? "" : "s"}
              </>
            ) : (
              `${dateLabel} ${formatDateTime(brand.updated_at)}`
            )}
          </span>
        }
      />
    </motion.div>
  );
}
