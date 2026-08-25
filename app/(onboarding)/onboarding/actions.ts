"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  brandProfileSchema,
  verificationUploadSchema,
  type BrandProfileInput,
  type VerificationUploadInput,
} from "@/lib/validations/brand";
import { logActivity } from "@/lib/admin/activity";

export interface OnboardingActionResult {
  error?: string;
  success?: boolean;
}

export async function updateBrandProfile(
  input: BrandProfileInput
): Promise<OnboardingActionResult> {
  const parsed = brandProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("brands")
    .update({
      ...parsed.data,
      status: "profile_completed",
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  await logActivity(user.id, "profile_update", { business_name: parsed.data.business_name });

  revalidatePath("/onboarding");
  return { success: true };
}

export async function submitVerificationDocuments(
  input: VerificationUploadInput
): Promise<OnboardingActionResult> {
  const parsed = verificationUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (brandError || !brand) return { error: "Brand not found" };
  if (brand.status !== "profile_completed") {
    return { error: "Complete your profile before uploading documents" };
  }

  const { error: docsError } = await supabase.from("brand_verifications").insert([
    {
      brand_id: brand.id,
      document_url: parsed.data.business_proof_url,
      document_type: "business_proof",
      status: "pending",
    },
    {
      brand_id: brand.id,
      document_url: parsed.data.id_proof_url,
      document_type: "id_proof",
      status: "pending",
    },
  ]);

  if (docsError) return { error: docsError.message };

  const { error: statusError } = await supabase
    .from("brands")
    .update({ status: "verification_pending" })
    .eq("user_id", user.id);

  if (statusError) return { error: statusError.message };

  await logActivity(user.id, "verification_submitted", { brand_id: brand.id });

  revalidatePath("/onboarding");
  return { success: true };
}

/** Called from the client after each document upload attempt (success or failure). */
export async function logUploadAttempt(
  documentType: "business_proof" | "id_proof" | "logo",
  success: boolean,
  errorMessage?: string
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await logActivity(user.id, "upload_attempt", {
    document_type: documentType,
    success,
    error: errorMessage,
  });
}
