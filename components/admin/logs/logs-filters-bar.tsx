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
import type { FilterUserOption } from "@/lib/admin/queries";

export function LogsFiltersBar({
  defaults,
  users,
}: {
  defaults: { userId?: string; eventType?: string; from?: string; to?: string };
  users: FilterUserOption[];
}) {
  return (
    <form method="get" className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
      <div className="w-56">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">User</label>
        <Select name="userId" defaultValue={defaults.userId ?? "all"}>
          <SelectTrigger>
            <SelectValue placeholder="All users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.user_id} value={u.user_id}>
                {u.business_name ?? u.email ?? u.user_id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-56">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Event type</label>
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
      <Button type="submit">Apply filters</Button>
    </form>
  );
}
