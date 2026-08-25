"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Zap, ClipboardList, Download, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BentoTile, BentoTileHeader } from "./bento-tile";
import { promoteToAdminByEmail, getSummaryReport } from "@/app/(admin)/admin/actions";
import { toCsv, downloadCsv } from "@/lib/csv";

export function QuickActionsTile({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handlePromote() {
    setPromoting(true);
    const result = await promoteToAdminByEmail(email);
    setPromoting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${email} is now an admin`);
    setEmail("");
    setDialogOpen(false);
  }

  async function handleExport() {
    setExporting(true);
    const report = await getSummaryReport();
    setExporting(false);

    if ("error" in report) {
      toast.error(report.error);
      return;
    }

    const csv = toCsv([
      {
        generated_at: report.generatedAt,
        total_brands: report.brands.total,
        approved_brands: report.brands.approved,
        pending_brands: report.brands.pending,
        rejected_brands: report.brands.rejected,
        pending_approvals: report.pendingApprovals,
        new_registrations_today: report.newRegistrationsToday,
        new_registrations_this_week: report.newRegistrationsThisWeek,
        revenue_this_month: report.revenueThisMonth,
      },
    ]);
    downloadCsv(`trusta-admin-summary-${Date.now()}.csv`, csv);
    toast.success("Report exported");
  }

  return (
    <BentoTile className={className}>
      <BentoTileHeader title="Quick actions" icon={Zap} />
      <div className="flex flex-col gap-2">
        <Button variant="outline" className="justify-start gap-2" asChild>
          <Link href="/admin/brands">
            <ClipboardList className="size-4" />
            Go to approval queue
          </Link>
        </Button>
        <Button
          variant="outline"
          className="justify-start gap-2"
          onClick={handleExport}
          disabled={exporting}
        >
          <Download className="size-4" />
          {exporting ? "Exporting..." : "Export report"}
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="justify-start gap-2">
              <UserPlus className="size-4" />
              Add admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Promote a user to admin</DialogTitle>
              <DialogDescription>
                Enter the email of an existing Trusta account to grant admin access.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handlePromote} disabled={promoting || !email.trim()}>
                {promoting ? "Promoting..." : "Promote to admin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BentoTile>
  );
}
