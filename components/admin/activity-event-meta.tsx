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

export const EVENT_META: Record<
  ActivityEventType,
  { label: string; icon: LucideIcon; color: string }
> = {
  login: { label: "Logged in", icon: LogIn, color: "text-emerald-600" },
  logout: { label: "Logged out", icon: LogOut, color: "text-muted-foreground" },
  profile_update: { label: "Updated profile", icon: UserCog, color: "text-blue-600" },
  purchase: { label: "Made a purchase", icon: ShoppingCart, color: "text-primary" },
  upload_attempt: { label: "Uploaded a document", icon: UploadCloud, color: "text-amber-600" },
  verification_submitted: {
    label: "Submitted for verification",
    icon: FileCheck2,
    color: "text-purple-600",
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
