import { Users2 } from "lucide-react";
import { getActiveUsersNow } from "@/lib/admin/queries";
import { BentoTile, BentoTileHeader } from "./bento-tile";

function initialsFor(name: string | null, email: string | null): string {
  if (name) return name.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

export async function ActiveUsersTile({ className }: { className?: string }) {
  const { count, users } = await getActiveUsersNow();

  return (
    <BentoTile className={className}>
      <BentoTileHeader title="Active users now" icon={Users2} />
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tight">{count}</span>
        {count > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            live
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">signed in within the last 5 minutes</p>

      {users.length > 0 && (
        <div className="mt-auto flex items-center pt-6">
          <div className="flex -space-x-2">
            {users.slice(0, 6).map((u) => (
              <span
                key={u.user_id}
                title={u.business_name ?? u.email ?? u.user_id}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary/10 text-[11px] font-semibold text-primary"
              >
                {initialsFor(u.business_name, u.email)}
              </span>
            ))}
          </div>
          {count > 6 && (
            <span className="ml-2 text-xs text-muted-foreground">+{count - 6} more</span>
          )}
        </div>
      )}
    </BentoTile>
  );
}
