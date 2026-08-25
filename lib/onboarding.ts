import type { BrandStatus } from "./supabase/types";

export interface OnboardingStepInfo {
  id: number;
  key: "registration" | "profile" | "verification" | "approval" | "dashboard";
  title: string;
  description: string;
}

export const ONBOARDING_STEPS: OnboardingStepInfo[] = [
  {
    id: 1,
    key: "registration",
    title: "Registration",
    description: "Create your account",
  },
  {
    id: 2,
    key: "profile",
    title: "Profile & Business Details",
    description: "Tell us about your business",
  },
  {
    id: 3,
    key: "verification",
    title: "Verification",
    description: "Upload business & ID proof",
  },
  {
    id: 4,
    key: "approval",
    title: "Admin Approval",
    description: "We review your application",
  },
  {
    id: 5,
    key: "dashboard",
    title: "Dashboard Access",
    description: "Start using Trusta",
  },
];

export type StepState = "complete" | "current" | "upcoming" | "rejected";

/** The step the brand should be actively working on (form input required). */
export function getActiveStep(status: BrandStatus): number {
  switch (status) {
    case "registered":
      return 2;
    case "profile_completed":
      return 3;
    case "verification_pending":
      return 4; // waiting on admin document review
    case "verified":
      return 4; // waiting on admin approval decision
    case "approved":
      return 5;
    case "rejected":
      return 4;
    default:
      return 1;
  }
}

export function getStepState(stepId: number, status: BrandStatus): StepState {
  const active = getActiveStep(status);

  if (status === "rejected" && stepId === 4) return "rejected";
  if (stepId < active) return "complete";
  if (stepId === active) return "current";
  return "upcoming";
}

export function getStatusCopy(status: BrandStatus): {
  title: string;
  description: string;
} {
  switch (status) {
    case "registered":
      return {
        title: "Let's set up your business profile",
        description: "Add your business details to continue onboarding.",
      };
    case "profile_completed":
      return {
        title: "Upload your verification documents",
        description: "We need a business proof and an ID proof to verify your account.",
      };
    case "verification_pending":
      return {
        title: "Verification in progress",
        description:
          "Your documents are being reviewed. This usually takes 1–2 business days.",
      };
    case "verified":
      return {
        title: "Awaiting admin approval",
        description:
          "Your documents are verified. Our team is reviewing your application for final approval.",
      };
    case "approved":
      return {
        title: "You're approved!",
        description: "Head to your dashboard to get started.",
      };
    case "rejected":
      return {
        title: "Application not approved",
        description:
          "Your application was not approved. See the remarks below for details.",
      };
    default:
      return { title: "Welcome to Trusta", description: "" };
  }
}
