"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FileClock, ShieldCheck, Search, ClipboardCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { BrandCard } from "./brand-card";
import { BrandDetailDrawer, type QueueEntry } from "./brand-detail-drawer";

type QueueKey = "verification" | "approval";
type SortOrder = "newest" | "oldest";

function filterAndSort(entries: QueueEntry[], search: string, sort: SortOrder): QueueEntry[] {
  const term = search.trim().toLowerCase();
  const filtered = term
    ? entries.filter((e) => (e.brand.business_name ?? "").toLowerCase().includes(term))
    : entries;

  return [...filtered].sort((a, b) => {
    const diff = new Date(a.brand.updated_at).getTime() - new Date(b.brand.updated_at).getTime();
    return sort === "newest" ? -diff : diff;
  });
}

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
  const [activeQueue, setActiveQueue] = useState<QueueKey>("verification");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [selected, setSelected] = useState<QueueEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const entries = activeQueue === "verification" ? verificationQueue : approvalQueue;
  const visible = useMemo(() => filterAndSort(entries, search, sort), [entries, search, sort]);

  function openEntry(entry: QueueEntry) {
    setSelected(entry);
    setDrawerOpen(true);
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={FileClock}
          label="Verification queue"
          count={verificationQueue.length}
          description="Applications pending verification"
          active={activeQueue === "verification"}
          onClick={() => setActiveQueue("verification")}
        />
        <StatCard
          icon={ShieldCheck}
          label="Approval queue"
          count={approvalQueue.length}
          description="Verified applications awaiting approval"
          active={activeQueue === "approval"}
          onClick={() => setActiveQueue("approval")}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand name..."
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortOrder)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          heading="All caught up!"
          description={
            search
              ? "No brands match your search."
              : activeQueue === "verification"
              ? "No brands waiting on document verification."
              : "No brands waiting on final approval."
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {visible.map((entry) => (
              <BrandCard
                key={entry.brand.id}
                brand={entry.brand}
                docCount={entry.docs.length}
                dateLabel={activeQueue === "verification" ? "Submitted" : "Verified"}
                onClick={() => openEntry(entry)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <BrandDetailDrawer
        entry={selected}
        mode={activeQueue}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onReviewVerification={onReviewVerification}
        onReviewApproval={onReviewApproval}
      />
    </div>
  );
}
