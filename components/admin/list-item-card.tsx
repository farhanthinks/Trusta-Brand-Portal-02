import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetaTag {
  icon?: LucideIcon;
  label: string;
}

interface ListItemCardProps {
  leading?: React.ReactNode;
  avatar?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: MetaTag[];
  badge?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
}

/**
 * The white bordered "row as a card" used across every admin list page —
 * brand review, users, approval history, activity logs. Each page supplies
 * its own avatar/title/meta/badge content; this just owns the shared shape,
 * spacing, and hover/click affordance.
 */
export function ListItemCard({
  leading,
  avatar,
  title,
  subtitle,
  meta,
  badge,
  trailing,
  onClick,
  showChevron = Boolean(onClick),
  className,
}: ListItemCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-white p-4 transition-all",
        onClick && "cursor-pointer hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        className
      )}
    >
      {leading}
      {avatar}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
        {meta && meta.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {meta.map((tag, i) => {
              const Icon = tag.icon;
              return (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-border">|</span>}
                  {Icon && <Icon className="size-3" />}
                  {tag.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {(badge || trailing) && (
          <div className="flex flex-col items-end gap-1">
            {badge}
            {trailing}
          </div>
        )}
        {showChevron && <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
      </div>
    </div>
  );
}
