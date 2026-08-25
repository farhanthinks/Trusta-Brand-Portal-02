"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BrandCard } from "./brand-card";
import { EmptyQueueState } from "./empty-queue-state";
import { BrandDetailDrawer, type QueueEntry } from "./brand-detail-drawer";

export function BrandsQueue({
  verificationQueue,
  approvalQueue,
  onReviewVerification,
  onReviewApproval,
}: {
  verificationQueue: QueueEntry[];
  approvalQueue: QueueEntry[];
  onReviewVerification: (
    brandId: string,
    decision: "verified" | "rejected",
    remarks: string | undefined
  ) => Promise<{ error?: string; success?: boolean }>;
  onReviewApproval: (
    brandId: string,
    decision: "approved" | "rejected",
    remarks: string | undefined
  ) => Promise<{ error?: string; success?: boolean }>;
}) {
  const [selected, setSelected] = useState<QueueEntry | null>(null);
  const [mode, setMode] = useState<"verification" | "approval">("verification");
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openEntry(entry: QueueEntry, entryMode: "verification" | "approval") {
    setSelected(entry);
    setMode(entryMode);
    setDrawerOpen(true);
  }

  return (
    <Tabs defaultValue="verification">
      <TabsList>
        <TabsTrigger value="verification">
          Verification queue
          {verificationQueue.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {verificationQueue.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="approval">
          Approval queue
          {approvalQueue.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {approvalQueue.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="verification" className="mt-6">
        {verificationQueue.length === 0 ? (
          <EmptyQueueState message="No brands waiting on document verification." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AnimatePresence>
              {verificationQueue.map((entry) => (
                <BrandCard
                  key={entry.brand.id}
                  brand={entry.brand}
                  docCount={entry.docs.length}
                  dateLabel="Submitted"
                  onClick={() => openEntry(entry, "verification")}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </TabsContent>

      <TabsContent value="approval" className="mt-6">
        {approvalQueue.length === 0 ? (
          <EmptyQueueState message="No brands waiting on final approval." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AnimatePresence>
              {approvalQueue.map((entry) => (
                <BrandCard
                  key={entry.brand.id}
                  brand={entry.brand}
                  docCount={entry.docs.length}
                  dateLabel="Verified"
                  onClick={() => openEntry(entry, "approval")}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </TabsContent>

      <BrandDetailDrawer
        entry={selected}
        mode={mode}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onReviewVerification={onReviewVerification}
        onReviewApproval={onReviewApproval}
      />
    </Tabs>
  );
}
