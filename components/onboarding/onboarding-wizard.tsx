"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import type { Brand } from "@/lib/supabase/types";
import { Stepper } from "./stepper";
import { ProfileForm } from "./profile-form";
import { VerificationForm } from "./verification-form";
import { WaitingScreen } from "./waiting-screen";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function OnboardingWizard({
  brand,
  userId,
  rejectionRemarks,
}: {
  brand: Brand;
  userId: string;
  rejectionRemarks?: string | null;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-10 rounded-xl border bg-card p-6 shadow-sm">
        <Stepper status={brand.status} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={brand.status}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          {brand.status === "registered" && (
            <Card>
              <CardHeader>
                <CardTitle>Profile & business details</CardTitle>
                <CardDescription>
                  This information helps us verify and represent your brand.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm brand={brand} userId={userId} onSaved={() => router.refresh()} />
              </CardContent>
            </Card>
          )}

          {brand.status === "profile_completed" && (
            <Card>
              <CardHeader>
                <CardTitle>Verification documents</CardTitle>
                <CardDescription>
                  Upload a business proof and an ID proof to verify your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VerificationForm userId={userId} onSubmitted={() => router.refresh()} />
              </CardContent>
            </Card>
          )}

          {(brand.status === "verification_pending" ||
            brand.status === "verified" ||
            brand.status === "approved" ||
            brand.status === "rejected") && (
            <WaitingScreen status={brand.status} remarks={rejectionRemarks} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
