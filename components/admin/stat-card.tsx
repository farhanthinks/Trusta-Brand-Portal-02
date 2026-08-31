import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  count: number | string;
  description: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * The light red/pink "counter" tile used at the top of admin list pages
 * (queue counts, active/suspended totals, etc). Doubles as a toggle button
 * when `onClick` is passed — used by the brand review page to switch
 * between the verification and approval queues.
 */
export function StatCard({
  icon: Icon,
  label,
  count,
  description,
  active,
  onClick,
  className,
}: StatCardProps) {
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border border-red-100 bg-red-50/70 p-5 text-left transition-all",
        onClick && "cursor-pointer hover:border-primary/30 hover:shadow-sm",
        active && "ring-2 ring-primary/40",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
          <Icon className="size-5" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">{label}</span>
          <span className={cn("font-bold text-primary", typeof count === "number" ? "text-2xl" : "text-lg")}>
            {count}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </Comp>
  );
}
