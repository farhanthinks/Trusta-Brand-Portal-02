"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { Brand } from "@/lib/supabase/types";

const STATUS_LABEL: Record<string, string> = {
  verification_pending: "Verification pending",
  verified: "Awaiting approval",
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
  return (
    <motion.button
      type="button"
      onClick={onClick}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left shadow-sm transition-shadow hover:border-primary/30 hover:shadow-md"
    >
      <Avatar className="size-11 shrink-0 border">
        {brand.logo_url && <AvatarImage src={brand.logo_url} alt={brand.business_name ?? ""} />}
        <AvatarFallback className="bg-red-50 text-sm font-semibold text-primary">
          {initialsFor(brand.business_name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{brand.business_name ?? "Unnamed business"}</p>
        <p className="text-sm text-muted-foreground">
          {dateLabel} {formatDate(brand.updated_at)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Badge variant="secondary" className="whitespace-nowrap">
          {STATUS_LABEL[brand.status] ?? brand.status}
        </Badge>
        {docCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="size-3" />
            {docCount} doc{docCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </motion.button>
  );
}
