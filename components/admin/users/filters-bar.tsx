import Link from "next/link";
import { RotateCcw, Search } from "lucide-react";
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
  const hasActiveFilters =
    defaults.q || defaults.status || defaults.businessType || defaults.from || defaults.to;

  return (
    <form
      method="get"
      className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm"
    >
      <div className="relative min-w-[200px] flex-1 basis-56">
        <label htmlFor="users-filter-q" className="sr-only">
          Search
        </label>
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="users-filter-q"
          name="q"
          defaultValue={defaults.q}
          placeholder="Search brand name or email..."
          className="pl-8"
        />
      </div>

      <div className="w-40 shrink-0">
        <label htmlFor="users-filter-status" className="sr-only">
          Status
        </label>
        <Select name="status" defaultValue={defaults.status ?? "all"}>
          <SelectTrigger id="users-filter-status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-44 shrink-0">
        <label htmlFor="users-filter-business-type" className="sr-only">
          Business type
        </label>
        <Select name="businessType" defaultValue={defaults.businessType ?? "all"}>
          <SelectTrigger id="users-filter-business-type">
            <SelectValue placeholder="All business types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All business types</SelectItem>
            {businessTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <label htmlFor="users-filter-from" className="text-xs text-muted-foreground">
          From
        </label>
        <Input id="users-filter-from" type="date" name="from" defaultValue={defaults.from} className="w-[128px]" />
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <label htmlFor="users-filter-to" className="text-xs text-muted-foreground">
          To
        </label>
        <Input id="users-filter-to" type="date" name="to" defaultValue={defaults.to} className="w-[128px]" />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button type="submit">
          <Search className="size-4" />
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <RotateCcw className="size-4" />
              Reset
            </Link>
          </Button>
        )}
      </div>
    </form>
  );
}
