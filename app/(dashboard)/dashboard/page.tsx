import { Suspense } from "react";
import { getCurrentBrand, getBrandEntitlements } from "@/lib/supabase/queries";
import { getSubscriptionCatalogItem, getUsageTotals } from "@/lib/dashboard/queries";
import { FadeIn } from "@/components/fade-in";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { YourPlanCard } from "@/components/dashboard/your-plan-card";
import { UsageSummaryCard } from "@/components/dashboard/usage-summary-card";
import { QuickActionsRow } from "@/components/dashboard/quick-actions-row";
import { RecentOrdersCard } from "@/components/dashboard/recent-orders-card";
import { UsefulInformationCard } from "@/components/dashboard/useful-information-card";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import { ProductCatalogNotice } from "@/components/dashboard/product-catalog-notice";
import { ListCardSkeleton } from "@/components/dashboard/skeletons";

export default async function DashboardPage() {
  // Layout already gates this route to an approved brand and derives it
  // from the session — never from client input.
  const brand = await getCurrentBrand();
  if (!brand) return null;

  const [entitlements, subscriptionCatalogItem, usage] = await Promise.all([
    getBrandEntitlements(brand.id),
    getSubscriptionCatalogItem(),
    getUsageTotals(brand.id),
  ]);

  return (
    <FadeIn className="space-y-6">
      <WelcomeSection brand={brand} />

      <SummaryCards entitlements={entitlements} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <YourPlanCard entitlements={entitlements} catalogItem={subscriptionCatalogItem} />
        <UsageSummaryCard entitlements={entitlements} usage={usage} />
      </div>

      <QuickActionsRow />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<ListCardSkeleton rows={5} />}>
            <RecentOrdersCard brandId={brand.id} />
          </Suspense>
        </div>
        <div className="space-y-6">
          <UsefulInformationCard />
          <Suspense fallback={<ListCardSkeleton rows={3} />}>
            <RecentActivityList brandId={brand.id} />
          </Suspense>
        </div>
      </div>

      <ProductCatalogNotice />
    </FadeIn>
  );
}
