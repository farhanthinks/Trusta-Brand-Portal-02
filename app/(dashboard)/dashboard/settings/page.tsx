import { redirect } from "next/navigation";
import {
  getCurrentUser,
  getCurrentProfile,
  getCurrentBrand,
  getBrandEntitlements,
} from "@/lib/supabase/queries";
import {
  getRecentSessionsForUser,
  getOrdersPage,
  getSubscriptionCatalogItem,
} from "@/lib/dashboard/queries";
import { getActiveSessionId } from "@/lib/admin/sessions";
import { SettingsTabs } from "@/components/settings/settings-tabs";

const RECENT_ORDERS_LIMIT = 10;
const RECENT_SESSIONS_LIMIT = 10;

export default async function SettingsPage() {
  const [user, profile, brand] = await Promise.all([
    getCurrentUser(),
    getCurrentProfile(),
    getCurrentBrand(),
  ]);

  if (!user || !profile || !brand) redirect("/login");

  const [entitlements, sessions, ordersPage, subscriptionCatalogItem, currentSessionId] =
    await Promise.all([
      getBrandEntitlements(brand.id),
      getRecentSessionsForUser(user.id, RECENT_SESSIONS_LIMIT),
      getOrdersPage(brand.id, 1, RECENT_ORDERS_LIMIT),
      getSubscriptionCatalogItem(),
      getActiveSessionId(),
    ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, business profile, security, and preferences.
        </p>
      </div>

      <SettingsTabs
        profile={profile}
        brand={brand}
        entitlements={entitlements}
        sessions={sessions}
        currentSessionId={currentSessionId}
        orders={ordersPage.rows}
        ordersTotal={ordersPage.total}
        subscriptionCatalogItem={subscriptionCatalogItem}
      />
    </div>
  );
}
