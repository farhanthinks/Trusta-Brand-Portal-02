import Link from "next/link";
import { cn } from "@/lib/utils";

interface BentoTileProps {
  className?: string;
  children: React.ReactNode;
  href?: string;
}

export function BentoTile({ className, children, href }: BentoTileProps) {
  const content = (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200",
        href && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30",
        className
      )}
    >
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="contents">
        {content}
      </Link>
    );
  }

  return content;
}

export function BentoTileHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {Icon && <Icon className="size-4" />}
      {title}
    </div>
  );
}

export function TileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm", className)}>
      <div className="mb-3 h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-8 w-16 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-3 w-32 animate-pulse rounded bg-muted" />
    </div>
  );
}
