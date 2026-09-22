"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getUserDetailByUserId,
  getUsersList,
  type UserDetail,
  type UsersListFilters,
} from "@/lib/admin/queries";

export interface AdminActionResult {
  error?: string;
  success?: boolean;
}

export async function setSuspended(
  targetUserId: string,
  suspended: boolean
): Promise<AdminActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { error: "Not authorized" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_suspended: suspended })
    .eq("id", targetUserId);

  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function bulkSetSuspended(
  targetUserIds: string[],
  suspended: boolean
): Promise<AdminActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { error: "Not authorized" };
  if (targetUserIds.length === 0) return { error: "No users selected" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_suspended: suspended })
    .in("id", targetUserIds);

  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function setAdminRole(
  targetUserId: string,
  makeAdmin: boolean
): Promise<AdminActionResult> {
  const { isAdmin, user } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };
  if (targetUserId === user.id && !makeAdmin) {
    return { error: "You can't revoke your own admin access" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_admin: makeAdmin })
    .eq("id", targetUserId);

  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Permanently deletes a brand/user account. Deletes the auth.users row via
 * the Admin API — every other table (profiles, brands, brand_verifications,
 * brand_approvals, orders, brand_entitlements, activity_logs, user_sessions)
 * cascades from there via existing ON DELETE CASCADE foreign keys, so there
 * is nothing left to clean up manually.
 *
 * The audit record is written to admin_actions (not activity_logs) *before*
 * the delete, specifically because activity_logs.user_id also cascades from
 * auth.users — logging there would just delete itself along with the user.
 */
export async function deleteBrandUser(targetUserId: string): Promise<AdminActionResult> {
  const { isAdmin, user } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };
  if (targetUserId === user.id) return { error: "You can't delete your own account" };

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("email, is_admin")
    .eq("id", targetUserId)
    .maybeSingle();

  if (profile?.is_admin) return { error: "Can't delete an admin account from here" };

  const { data: brand } = await admin
    .from("brands")
    .select("business_name")
    .eq("user_id", targetUserId)
    .maybeSingle();

  await admin.from("admin_actions").insert({
    action_type: "user_deleted",
    performed_by: user.id,
    target_user_id: targetUserId,
    target_email: profile?.email ?? null,
    target_business_name: brand?.business_name ?? null,
  });

  const { error } = await admin.auth.admin.deleteUser(targetUserId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { success: true };
}

export async function getUserDetailAction(
  userId: string
): Promise<UserDetail & { documentUrls: Record<string, string> }> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return {
      brand: null,
      profile: null,
      verifications: [],
      orders: [],
      recentActivity: [],
      entitlements: null,
      documentUrls: {},
    };
  }

  const detail = await getUserDetailByUserId(userId);
  const admin = createAdminClient();
  const documentUrls: Record<string, string> = {};

  for (const v of detail.verifications) {
    const path = v.document_url as string;
    const { data } = await admin.storage.from("brand-documents").createSignedUrl(path, 300);
    if (data?.signedUrl) documentUrls[path] = data.signedUrl;
  }

  return { ...detail, documentUrls };
}

/** Full (unpaginated) export honoring the current list filters — used by the header's Export button. */
export async function exportUsersList(filters: Omit<UsersListFilters, "page" | "pageSize">) {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { error: "Not authorized" };

  const { rows } = await getUsersList({ ...filters, page: 1, pageSize: 10000 });
  return rows;
}
