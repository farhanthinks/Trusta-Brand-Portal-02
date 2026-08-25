import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTION_OPTIONS = [
  { value: "verified", label: "Verified" },
  { value: "rejected_verification", label: "Rejected (verification)" },
  { value: "approved", label: "Approved" },
  { value: "rejected_approval", label: "Rejected (approval)" },
] as const;

export function ApprovalsFiltersBar({
  defaults,
  admins,
}: {
  defaults: { actionType?: string; adminId?: string; from?: string; to?: string };
  admins: { id: string; email: string | null }[];
}) {
  return (
    <form method="get" className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
      <div className="w-56">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Action</label>
        <Select name="actionType" defaultValue={defaults.actionType ?? "all"}>
          <SelectTrigger>
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {ACTION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-56">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Admin</label>
        <Select name="adminId" defaultValue={defaults.adminId ?? "all"}>
          <SelectTrigger>
            <SelectValue placeholder="All admins" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All admins</SelectItem>
            {admins.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.email ?? a.id}
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
