import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  heading,
  description,
}: {
  icon: LucideIcon;
  heading: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-red-50">
        <Icon className="size-6 text-primary" />
      </div>
      <p className="text-sm font-medium">{heading}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
