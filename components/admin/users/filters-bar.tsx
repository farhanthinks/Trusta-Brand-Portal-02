import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { businessTypes } from "@/lib/validations/brand";

const STATUS_OPTIONS = [
  "registered",
  "profile_completed",
  "verification_pending",
  "verified",
  "approved",
  "rejected",
] as const;

export function UsersFiltersBar({
  defaults,
}: {
  defaults: {
    q?: string;
    status?: string;
    businessType?: string;
    from?: string;
    to?: string;
  };
}) {
  return (
    <form method="get" className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
      <div className="min-w-[200px] flex-1">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={defaults.q}
            placeholder="Business name..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="w-44">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
        <Select name="status" defaultValue={defaults.status ?? "all"}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-48">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Business type
        </label>
        <Select name="businessType" defaultValue={defaults.businessType ?? "all"}>
          <SelectTrigger>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {businessTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-40">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">From</label>
        <Input type="date" name="from" defaultValue={defaults.from} />
      </div>
      <div className="w-40">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">To</label>
        <Input type="date" name="to" defaultValue={defaults.to} />
      </div>

      <Button type="submit">Apply filters</Button>
    </form>
  );
}
