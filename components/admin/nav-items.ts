import type { LucideIcon } from "lucide-react";
import { LayoutGrid, ClipboardCheck, Users, History, Activity, Radio } from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Add new admin sections here — the sidebar and mobile nav both read this
// single list, so a new tile/page only needs one line added.
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/brands", label: "Brand Review", icon: ClipboardCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/approvals", label: "Approval History", icon: History },
  { href: "/admin/logs", label: "Activity Logs", icon: Activity },
  { href: "/admin/sessions", label: "Active Sessions", icon: Radio },
];
