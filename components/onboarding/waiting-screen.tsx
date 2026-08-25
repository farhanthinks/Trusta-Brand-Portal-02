"use client";

import { motion } from "framer-motion";
import { Clock, ShieldCheck, XCircle, PartyPopper } from "lucide-react";
import Link from "next/link";

import type { BrandStatus } from "@/lib/supabase/types";
import { getStatusCopy } from "@/lib/onboarding";
import { Button } from "@/components/ui/button";

export function WaitingScreen({
  status,
  remarks,
}: {
  status: BrandStatus;
  remarks?: string | null;
}) {
  const copy = getStatusCopy(status);

  const icon =
    status === "rejected" ? (
      <XCircle className="size-10 text-destructive" />
    ) : status === "approved" ? (
      <PartyPopper className="size-10 text-primary" />
    ) : status === "verified" ? (
      <ShieldCheck className="size-10 text-primary" />
    ) : (
      <Clock className="size-10 text-primary" />
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center rounded-xl border bg-card p-10 text-center shadow-sm"
    >
      <motion.div
        animate={
          status === "verification_pending" || status === "verified"
            ? { rotate: [0, -8, 8, -8, 0] }
            : {}
        }
        transition={{ repeat: Infinity, repeatDelay: 3, duration: 1.2 }}
        className="mb-4"
      >
        {icon}
      </motion.div>
      <h2 className="text-xl font-semibold">{copy.title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{copy.description}</p>

      {status === "rejected" && remarks && (
        <div className="mt-4 w-full rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-left text-sm">
          <p className="font-medium text-destructive">Reviewer remarks</p>
          <p className="mt-1 text-muted-foreground">{remarks}</p>
        </div>
      )}

      {status === "approved" && (
        <Link href="/dashboard" className="mt-6">
          <Button>Go to dashboard</Button>
        </Link>
      )}
    </motion.div>
  );
}
