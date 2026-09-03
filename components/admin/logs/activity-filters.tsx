import Link from "next/link";
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
import { EVENT_TYPE_OPTIONS, EVENT_META } from "@/components/admin/activity-event-meta";

export interface ActivityFiltersUser {
  id: string;
  label: string;
}

/**
 * Shared filter row for both the brand summary page (search + user +
 * event + date range) and the per-brand detail page (event + date range
 * only — `users` and `search` are omitted there since a single brand's
 * event set is already narrow).
 *
 * Single-line layout, no stacked label-above-input — the Select
 * placeholders ("All users" / "All events") and inline "From"/"To" text
 * already say what each field is, so a separate label row was just adding
 * height without adding clarity. Labels are kept for screen readers via
 * sr-only rather than dropped outright.
 */
export function ActivityFilters({
  basePath,
  defaults,
  users,
  showSearch = true,
  searchPlaceholder = "Search by brand name or email...",
}: {
  basePath: string;
  defaults: { q?: string; userId?: string; eventType?: string; from?: string; to?: string };
  users?: ActivityFiltersUser[];
  showSearch?: boolean;
  searchPlaceholder?: string;
}) {
  const hasActiveFilters =
    defaults.q || defaults.userId || defaults.eventType || defaults.from || defaults.to;

  return (
    <form
      method="get"
      action={basePath}
      className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm"
    >
      {showSearch && (
        <div className="relative min-w-[200px] flex-1 basis-56">
          <label htmlFor="activity-filter-q" className="sr-only">
            Search
          </label>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="activity-filter-q"
            name="q"
            defaultValue={defaults.q}
            placeholder={searchPlaceholder}
            className="pl-8"
          />
        </div>
      )}

      {users && (
        <div className="w-36 shrink-0">
          <label htmlFor="activity-filter-user" className="sr-only">
            User
          </label>
          <Select name="userId" defaultValue={defaults.userId ?? "all"}>
            <SelectTrigger id="activity-filter-user">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="w-36 shrink-0">
        <label htmlFor="activity-filter-event" className="sr-only">
          Event
        </label>
        <Select name="eventType" defaultValue={defaults.eventType ?? "all"}>
          <SelectTrigger id="activity-filter-event">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {EVENT_TYPE_OPTIONS.map((e) => (
              <SelectItem key={e} value={e}>
                {EVENT_META[e].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <label htmlFor="activity-filter-from" className="text-xs text-muted-foreground">
          From
        </label>
        <Input id="activity-filter-from" type="date" name="from" defaultValue={defaults.from} className="w-[128px]" />
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <label htmlFor="activity-filter-to" className="text-xs text-muted-foreground">
          To
        </label>
        <Input id="activity-filter-to" type="date" name="to" defaultValue={defaults.to} className="w-[128px]" />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button type="submit">Apply Filters</Button>
        {hasActiveFilters && (
          <Button variant="outline" asChild>
            <Link href={basePath}>Clear</Link>
          </Button>
        )}
      </div>
    </form>
  );
}
