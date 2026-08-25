import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SessionsFiltersBar({ defaults }: { defaults: { status?: string } }) {
  return (
    <form method="get" className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4">
      <div className="w-48">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
        <Select name="status" defaultValue={defaults.status ?? "all"}>
          <SelectTrigger>
            <SelectValue placeholder="All sessions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sessions</SelectItem>
            <SelectItem value="active">Active now</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Apply filters</Button>
    </form>
  );
}
