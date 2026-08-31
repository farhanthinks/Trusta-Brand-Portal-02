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
      className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4"
    >
      {showSearch && (
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={defaults.q} placeholder={searchPlaceholder} className="pl-8" />
          </div>
        </div>
      )}

      {users && (
        <div className="w-52">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">User</label>
          <Select name="userId" defaultValue={defaults.userId ?? "all"}>
            <SelectTrigger>
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="w-52">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Event</label>
        <Select name="eventType" defaultValue={defaults.eventType ?? "all"}>
          <SelectTrigger>
            <SelectValue placeholder="All events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            {EVENT_TYPE_OPTIONS.map((e) => (
              <SelectItem key={e} value={e}>
                {EVENT_META[e].label}
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

      <Button type="submit">Apply Filters</Button>
      {hasActiveFilters && (
        <Button variant="outline" asChild>
          <Link href={basePath}>Clear</Link>
        </Button>
      )}
    </form>
  );
}
