"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";

export interface AdminActionResult {
  error?: string;
  success?: boolean;
}

function revalidateBrandViews() {
  revalidatePath("/admin/brands");
  revalidatePath("/admin");
  revalidatePath("/admin/approvals");
}

export async function reviewVerification(
  brandId: string,
  decision: "verified" | "rejected",
  remarks: string | undefined
): Promise<AdminActionResult> {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };

  const [{ error: docsError }, { error: brandError }] = await Promise.all([
    supabase
      .from("brand_verifications")
      .update({
        status: decision,
        remarks: remarks || null,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      })
      .eq("brand_id", brandId)
      .eq("status", "pending"),
    supabase
      .from("brands")
      .update({ status: decision === "verified" ? "verified" : "rejected" })
      .eq("id", brandId),
  ]);

  if (docsError) return { error: docsError.message };
  if (brandError) return { error: brandError.message };

  revalidateBrandViews();
  return { success: true };
}

export async function reviewApproval(
  brandId: string,
  decision: "approved" | "rejected",
  remarks: string | undefined
): Promise<AdminActionResult> {
  const { supabase, user, isAdmin } = await requireAdmin();
  if (!isAdmin || !user) return { error: "Not authorized" };

  // Idempotency guard: brand_approvals is an insert, not an update, so unlike
  // reviewVerification it has no natural "already handled" no-op. Reject a
  // second decision on a brand that's already past the "verified" stage
  // (e.g. a race between two tabs, or a retried request) instead of
  // inserting a duplicate history row.
  const { data: current } = await supabase
    .from("brands")
    .select("status")
    .eq("id", brandId)
    .maybeSingle();
  if (current?.status !== "verified") {
    return { error: "This brand has already been reviewed" };
  }

  const [{ error: approvalError }, { error: brandError }] = await Promise.all([
    supabase.from("brand_approvals").insert({
      brand_id: brandId,
      status: decision,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      remarks: remarks || null,
    }),
    supabase.from("brands").update({ status: decision }).eq("id", brandId),
  ]);

  if (approvalError) return { error: approvalError.message };
  if (brandError) return { error: brandError.message };

  revalidateBrandViews();
  return { success: true };
}
