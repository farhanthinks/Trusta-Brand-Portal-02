import { QrCode, Zap, Sparkles, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { BrandEntitlement } from "@/lib/supabase/types";

function daysUntil(iso: string): number {
  const diffMs = new Date(iso).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function MiniCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="size-4" />
          {label}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function SummaryCards({ entitlements }: { entitlements: BrandEntitlement | null }) {
  const hasPlan = Boolean(entitlements?.subscription_plan);
  const expiresAt = entitlements?.subscription_expires_at ?? null;
  const isActive = Boolean(hasPlan && expiresAt && new Date(expiresAt) > new Date());
  const days = expiresAt ? daysUntil(expiresAt) : null;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MiniCard icon={QrCode} label="Static QR Credits">
        <p className="text-2xl font-bold">{entitlements?.qr_quota ?? 0}</p>
      </MiniCard>

      <MiniCard icon={Zap} label="Dynamic QR Credits">
        <p className="text-2xl font-bold">{entitlements?.dynamic_qr_quota ?? 0}</p>
      </MiniCard>

      <MiniCard icon={Sparkles} label="Plan Status">
        {hasPlan ? (
          <div className="flex items-center gap-2">
            <p className="truncate text-lg font-bold">{entitlements!.subscription_plan}</p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                isActive ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        ) : (
          <p className="text-lg font-bold text-muted-foreground">No plan</p>
        )}
      </MiniCard>

      <MiniCard icon={CalendarClock} label="Plan Renewal">
        {expiresAt ? (
          <>
            <p className="text-lg font-bold">{formatDate(expiresAt)}</p>
            <p className="text-xs text-muted-foreground">
              {days !== null && days >= 0 ? `${days} day${days === 1 ? "" : "s"} left` : "Expired"}
            </p>
          </>
        ) : (
          <p className="text-lg font-bold text-muted-foreground">—</p>
        )}
      </MiniCard>
    </div>
  );
}
