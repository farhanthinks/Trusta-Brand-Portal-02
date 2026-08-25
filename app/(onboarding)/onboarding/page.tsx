import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!brand) {
    // Should not happen — the brand row is created at sign-up — but fail
    // safe rather than showing a broken wizard.
    redirect("/sign-up");
  }

  if (brand.status === "approved") {
    redirect("/dashboard");
  }

  let rejectionRemarks: string | null = null;
  if (brand.status === "rejected") {
    const { data: approval } = await supabase
      .from("brand_approvals")
      .select("remarks")
      .eq("brand_id", brand.id)
      .eq("status", "rejected")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (approval?.remarks) {
      rejectionRemarks = approval.remarks;
    } else {
      const { data: verification } = await supabase
        .from("brand_verifications")
        .select("remarks")
        .eq("brand_id", brand.id)
        .eq("status", "rejected")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      rejectionRemarks = verification?.remarks ?? null;
    }
  }

  return (
    <OnboardingWizard brand={brand} userId={user.id} rejectionRemarks={rejectionRemarks} />
  );
}
