"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getBrandsBreakdown,
  getNewRegistrations,
  getRevenueThisMonth,
  getPendingApprovalsCount,
} from "@/lib/admin/queries";

export interface AdminActionResult {
  error?: string;
  success?: boolean;
}

export async function promoteToAdminByEmail(email: string): Promise<AdminActionResult> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { error: "Not authorized" };
  if (!email.trim()) return { error: "Enter an email address" };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email.trim())
    .maybeSingle();

  if (!profile) return { error: `No user found with email ${email}` };

  const { error } = await admin.from("profiles").update({ is_admin: true }).eq("id", profile.id);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export interface SummaryReport {
  generatedAt: string;
  brands: { total: number; approved: number; pending: number; rejected: number };
  pendingApprovals: number;
  newRegistrationsToday: number;
  newRegistrationsThisWeek: number;
  revenueThisMonth: number;
}

export async function getSummaryReport(): Promise<SummaryReport | { error: string }> {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return { error: "Not authorized" };

  const [brands, registrations, revenue, pending] = await Promise.all([
    getBrandsBreakdown(),
    getNewRegistrations(),
    getRevenueThisMonth(),
    getPendingApprovalsCount(),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    brands,
    pendingApprovals: pending,
    newRegistrationsToday: registrations.today,
    newRegistrationsThisWeek: registrations.thisWeek,
    revenueThisMonth: revenue,
  };
}
