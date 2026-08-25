import Link from "next/link";
import { LayoutDashboard, ShoppingBag } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import type { Brand } from "@/lib/supabase/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/purchase", label: "Purchase QR / Subscription", icon: ShoppingBag },
];

export function DashboardShell({
  brand,
  children,
}: {
  brand: Brand;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 sm:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            T
          </span>
          <span className="font-semibold tracking-tight">Trusta</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {brand.business_name}
          </span>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-8 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
