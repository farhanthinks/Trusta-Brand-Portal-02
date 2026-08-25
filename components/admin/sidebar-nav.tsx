"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "./nav-items";

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="admin-nav-active"
                className="absolute inset-0 rounded-lg bg-red-50"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <Icon className="relative z-10 size-4 shrink-0" />
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
