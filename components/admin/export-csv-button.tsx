"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toCsv, downloadCsv } from "@/lib/csv";

export function ExportCsvButton<T>({
  fetchRows,
  toRow,
  filenamePrefix,
}: {
  fetchRows: () => Promise<T[] | { error: string }>;
  toRow: (row: T) => Record<string, unknown>;
  filenamePrefix: string;
}) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    const result = await fetchRows();
    setExporting(false);

    if (!Array.isArray(result)) {
      toast.error(result.error);
      return;
    }
    if (result.length === 0) {
      toast.error("Nothing to export for the current filters");
      return;
    }

    const csv = toCsv(result.map(toRow));
    downloadCsv(`${filenamePrefix}-${Date.now()}.csv`, csv);
    toast.success("Exported to CSV");
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={exporting}>
      <Download className="size-4" />
      {exporting ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
