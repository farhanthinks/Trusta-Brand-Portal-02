import Link from "next/link";
import { QrCode, Sparkles, Receipt, History, Settings, ArrowRight } from "lucide-react";

// Only actions that lead somewhere real today — no placeholder links to
// pages that don't exist yet (e.g. a dedicated billing-history page).
const ACTIONS = [
  { href: "/purchase/qr", label: "Purchase QR Credits", icon: QrCode },
  { href: "/purchase/subscription", label: "Buy Subscription Plan", icon: Sparkles },
  { href: "/dashboard/orders", label: "View Orders", icon: Receipt },
  { href: "/dashboard/orders", label: "Billing History", icon: History },
  { href: "/purchase/subscription", label: "Manage Plan", icon: Settings },
];

export function QuickActionsRow() {
  return (
    <div>
      <h2 className="mb-3 text-base font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex flex-col gap-2 rounded-xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <action.icon className="size-5 text-primary" />
            <span className="flex items-center gap-1 text-sm font-medium">
              {action.label}
              <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
