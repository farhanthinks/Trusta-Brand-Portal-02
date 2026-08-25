"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS, getStepState } from "@/lib/onboarding";
import type { BrandStatus } from "@/lib/supabase/types";

export function Stepper({ status }: { status: BrandStatus }) {
  return (
    <div className="w-full">
      {/* Desktop */}
      <ol className="hidden items-start sm:flex">
        {ONBOARDING_STEPS.map((step, idx) => {
          const state = getStepState(step.id, status);
          return (
            <li key={step.id} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div className="flex-1">
                  {idx > 0 && (
                    <div
                      className={cn(
                        "h-0.5 w-full transition-colors duration-500",
                        state === "upcoming" ? "bg-border" : "bg-primary"
                      )}
                    />
                  )}
                </div>
                <StepCircle state={state} id={step.id} />
                <div className="flex-1">
                  {idx < ONBOARDING_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 w-full transition-colors duration-500",
                        state === "complete" ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
              </div>
              <div className="mt-2 max-w-[9rem] text-center">
                <p
                  className={cn(
                    "text-xs font-medium",
                    state === "current" ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile */}
      <ol className="flex flex-col gap-3 sm:hidden">
        {ONBOARDING_STEPS.map((step) => {
          const state = getStepState(step.id, status);
          return (
            <li key={step.id} className="flex items-center gap-3">
              <StepCircle state={state} id={step.id} size="sm" />
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    state === "current" ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepCircle({
  state,
  id,
  size = "md",
}: {
  state: "complete" | "current" | "upcoming" | "rejected";
  id: number;
  size?: "sm" | "md";
}) {
  const dimensions = size === "sm" ? "size-7 text-xs" : "size-9 text-sm";

  return (
    <motion.div
      initial={false}
      animate={{ scale: state === "current" ? 1.1 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 font-semibold",
        dimensions,
        state === "complete" && "border-primary bg-primary text-primary-foreground",
        state === "current" && "border-primary bg-white text-primary ring-4 ring-primary/15",
        state === "upcoming" && "border-border bg-white text-muted-foreground",
        state === "rejected" && "border-destructive bg-destructive text-destructive-foreground"
      )}
    >
      {state === "complete" ? (
        <Check className="size-4" />
      ) : state === "rejected" ? (
        <X className="size-4" />
      ) : (
        id
      )}
    </motion.div>
  );
}
