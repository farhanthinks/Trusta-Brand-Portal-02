import Link from "next/link";
import { QrCode, ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Brand } from "@/lib/supabase/types";

export function WelcomeSection({ brand }: { brand: Brand }) {
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {brand.business_name ?? "there"}
          </h1>
          {brand.status === "approved" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <BadgeCheck className="size-3.5" />
              Verified
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your Trusta account.
        </p>
      </div>
      <Link href="/purchase">
        <Button size="lg">
          <QrCode className="mr-2 size-4" />
          Purchase QR / Subscription
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </Link>
    </div>
  );
}
