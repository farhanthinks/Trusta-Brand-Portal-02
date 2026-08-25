"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserDetail, type UserDetail } from "@/lib/admin/queries";

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

export async function getUserDetailAction(
  brandId: string
): Promise<UserDetail & { documentUrls: Record<string, string> }> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) {
    return { brand: null, profile: null, verifications: [], orders: [], recentActivity: [], documentUrls: {} };
  }

  const detail = await getUserDetail(brandId);
  const admin = createAdminClient();
  const documentUrls: Record<string, string> = {};

  for (const v of detail.verifications) {
    const path = v.document_url as string;
    const { data } = await admin.storage.from("brand-documents").createSignedUrl(path, 300);
    if (data?.signedUrl) documentUrls[path] = data.signedUrl;
  }

  return { ...detail, documentUrls };
}
