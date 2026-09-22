"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/admin/activity";
import { getActiveSessionId, endAllSessions } from "@/lib/admin/sessions";
import {
  accountInfoSchema,
  notificationPreferencesSchema,
  type AccountInfoInput,
  type NotificationPreferencesInput,
} from "@/lib/validations/settings";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth";

export interface SettingsActionResult {
  error?: string;
  success?: boolean;
}

/**
 * Every write below goes through the service-role client, gated by a
 * server-side `supabase.auth.getUser()` check that the caller is only ever
 * touching their own row — never a raw RLS-authorized client update. This
 * mirrors the admin actions in app/(admin)/admin/users/actions.ts (same
 * "service role + explicit self/target check" shape) and, unlike an RLS
 * policy, can't be widened by a mistaken policy edit into letting a user
 * write columns like is_admin/is_suspended on their own profile row.
 */
async function requireSelf() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function updateAccountInfo(input: AccountInfoInput): Promise<SettingsActionResult> {
  const parsed = accountInfoSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { user } = await requireSelf();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  await logActivity(user.id, "profile_update", { section: "account" });
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateNotificationPreferences(
  input: NotificationPreferencesInput
): Promise<SettingsActionResult> {
  const parsed = notificationPreferencesSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { user } = await requireSelf();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ notification_preferences: parsed.data })
    .eq("id", user.id);

  if (error) return { error: error.message };

  await logActivity(user.id, "profile_update", { section: "notifications", ...parsed.data });
  revalidatePath("/dashboard/settings");
  return { success: true };
}

/**
 * Re-authenticates with the current password before accepting the new one —
 * updateUser() alone would let anyone with a live session set a new password
 * with no proof they know the old one.
 */
export async function changePassword(input: ChangePasswordInput): Promise<SettingsActionResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Not authenticated" };

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (reauthError) return { error: "Current password is incorrect" };

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });
  if (updateError) return { error: updateError.message };

  await logActivity(user.id, "profile_update", { section: "password" });
  return { success: true };
}

/**
 * Logs the current device out along with every other active session for
 * this user. supabase.auth.signOut({ scope: "global" }) is what actually
 * revokes other devices' refresh tokens; endAllSessions() only closes out
 * our own analytics table. Ends in a redirect because this necessarily also
 * signs out the device that clicked the button.
 */
export async function logoutAllDevices(): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const sessionId = await getActiveSessionId();
    await endAllSessions(user.id);
    await logActivity(user.id, "logout", { scope: "all_devices" }, sessionId);
  }

  await supabase.auth.signOut({ scope: "global" });
  redirect("/login");
}

/**
 * Reversible self-suspend: reuses profiles.is_suspended, the exact flag
 * every login/layout guard already checks, so deactivation is enforced
 * everywhere for free with no new gating logic. deactivated_at exists only
 * to tell "deactivated themselves" apart from an admin-imposed suspension.
 */
export async function deactivateAccount(): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({ is_suspended: true, deactivated_at: new Date().toISOString() })
      .eq("id", user.id);
    await logActivity(user.id, "profile_update", { section: "account", action: "deactivated" });
  }

  await supabase.auth.signOut({ scope: "global" });
  redirect("/login");
}

/**
 * Permanently deletes the caller's own account — same underlying mechanism
 * as the admin's deleteBrandUser (auth.admin.deleteUser cascades through
 * every FK), just self-targeted with no admin check. The admin_actions
 * audit row is written before the delete for the same reason
 * deleteBrandUser writes it there instead of activity_logs: activity_logs
 * rows would be destroyed by the very cascade they're recording.
 */
export async function deleteOwnAccount(): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: brand } = await admin
    .from("brands")
    .select("business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  await admin.from("admin_actions").insert({
    action_type: "user_deleted",
    performed_by: user.id,
    target_user_id: user.id,
    target_email: user.email ?? null,
    target_business_name: brand?.business_name ?? null,
    details: { self_initiated: true },
  });

  await admin.auth.admin.deleteUser(user.id);
  await supabase.auth.signOut({ scope: "global" });
  redirect("/login");
}
