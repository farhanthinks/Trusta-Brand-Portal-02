import {
  LogIn,
  LogOut,
  UserCog,
  ShoppingCart,
  UploadCloud,
  FileCheck2,
  type LucideIcon,
} from "lucide-react";
import type { ActivityEventType } from "@/lib/supabase/types";

export type EventCategory = "auth" | "brand" | "user" | "purchase";

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  auth: "Auth",
  brand: "Brand",
  user: "User",
  purchase: "Purchase",
};

export const CATEGORY_STYLES: Record<EventCategory, string> = {
  auth: "bg-emerald-100 text-emerald-700",
  brand: "bg-purple-100 text-purple-700",
  user: "bg-blue-100 text-blue-700",
  purchase: "bg-red-100 text-red-700",
};

export const EVENT_META: Record<
  ActivityEventType,
  { label: string; icon: LucideIcon; color: string; category: EventCategory }
> = {
  login: { label: "Logged in", icon: LogIn, color: "text-emerald-600", category: "auth" },
  logout: { label: "Logged out", icon: LogOut, color: "text-muted-foreground", category: "auth" },
  profile_update: {
    label: "Profile updated",
    icon: UserCog,
    color: "text-blue-600",
    category: "user",
  },
  purchase: {
    label: "Purchase completed",
    icon: ShoppingCart,
    color: "text-primary",
    category: "purchase",
  },
  upload_attempt: {
    label: "Document uploaded",
    icon: UploadCloud,
    color: "text-amber-600",
    category: "brand",
  },
  verification_submitted: {
    label: "Submitted for verification",
    icon: FileCheck2,
    color: "text-purple-600",
    category: "brand",
  },
};

export const EVENT_TYPE_OPTIONS: ActivityEventType[] = [
  "login",
  "logout",
  "profile_update",
  "purchase",
  "upload_attempt",
  "verification_submitted",
];

export function displayNameFor(businessName: string | null, email: string | null): string {
  return businessName || email || "Unknown user";
}

const ITEM_TYPE_LABEL: Record<string, string> = {
  qr: "QR purchase",
  dynamic_qr: "Dynamic QR purchase",
  subscription: "Subscription purchase",
  other: "Purchase",
};

/**
 * A more specific label than EVENT_META's generic one, derived from metadata
 * that's already captured at write time (never invented) — e.g. "QR
 * purchase" vs "Subscription purchase" from a purchase event's item_type,
 * or "Document upload failed" from an upload_attempt's success flag.
 */
export function getEventLabel(
  eventType: ActivityEventType,
  metadata: Record<string, unknown>
): string {
  if (eventType === "purchase") {
    const itemType = typeof metadata.item_type === "string" ? metadata.item_type : undefined;
    return (itemType && ITEM_TYPE_LABEL[itemType]) || EVENT_META.purchase.label;
  }
  if (eventType === "upload_attempt") {
    return metadata.success === false ? "Document upload failed" : EVENT_META.upload_attempt.label;
  }
  return EVENT_META[eventType].label;
}
