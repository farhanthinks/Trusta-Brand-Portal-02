"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AccountSection } from "./account-section";
import { BusinessProfileSection } from "./business-profile-section";
import { SecuritySection } from "./security-section";
import { NotificationsSection } from "./notifications-section";
import { BillingSection } from "./billing-section";
import { DangerZoneSection } from "./danger-zone-section";
import type { Brand, BrandEntitlement, CatalogItem, Order, Profile, UserSession } from "@/lib/supabase/types";

export function SettingsTabs({
  profile,
  brand,
  entitlements,
  sessions,
  currentSessionId,
  orders,
  ordersTotal,
  subscriptionCatalogItem,
}: {
  profile: Profile;
  brand: Brand;
  entitlements: BrandEntitlement | null;
  sessions: UserSession[];
  currentSessionId: string | null;
  orders: Order[];
  ordersTotal: number;
  subscriptionCatalogItem: CatalogItem | null;
}) {
  return (
    <Tabs defaultValue="account">
      <div className="mb-6 overflow-x-auto">
        <TabsList className="h-auto w-full justify-start gap-1 bg-muted/50 p-1 sm:w-fit">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="danger" className="text-destructive">
            Danger Zone
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="account">
        <AccountSection profile={profile} />
      </TabsContent>
      <TabsContent value="business">
        <BusinessProfileSection brand={brand} />
      </TabsContent>
      <TabsContent value="security">
        <SecuritySection sessions={sessions} currentSessionId={currentSessionId} />
      </TabsContent>
      <TabsContent value="notifications">
        <NotificationsSection preferences={profile.notification_preferences} />
      </TabsContent>
      <TabsContent value="billing">
        <BillingSection
          entitlements={entitlements}
          subscriptionCatalogItem={subscriptionCatalogItem}
          orders={orders}
          ordersTotal={ordersTotal}
        />
      </TabsContent>
      <TabsContent value="danger">
        <DangerZoneSection />
      </TabsContent>
    </Tabs>
  );
}
