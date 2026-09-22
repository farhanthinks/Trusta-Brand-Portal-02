"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { LayoutDashboard, ShoppingBag, Settings } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandProfileCard } from "./brand-profile-card";
import { cn } from "@/lib/utils";
import type { Brand, BrandEntitlement } from "@/lib/supabase/types";

// Only features that actually exist get a nav entry — no placeholder links.
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/purchase", label: "Purchase QR / Subscription", icon: ShoppingBag },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        T
      </span>
      <span className="font-semibold tracking-tight">Trusta</span>
    </Link>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-red-50 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  brand,
  email,
  entitlements,
  children,
}: {
  brand: Brand;
  email: string | null;
  entitlements: BrandEntitlement | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/20">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-white p-4 lg:flex">
        <div className="mb-6 px-2">
          <Logo />
        </div>
        <div className="flex-1">
          <NavLinks pathname={pathname} />
        </div>
        <BrandProfileCard brand={brand} email={email} entitlements={entitlements} />
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between border-b bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-72 flex-col bg-white p-4">
                <SheetHeader className="mb-6 items-start p-0">
                  <SheetTitle asChild>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1">
                  <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                </div>
                <BrandProfileCard brand={brand} email={email} entitlements={entitlements} />
              </SheetContent>
            </Sheet>
            <span className="lg:hidden">
              <Logo />
            </span>
            <span className="hidden text-sm font-medium lg:inline">{brand.business_name}</span>
          </div>
          <LogoutButton />
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
