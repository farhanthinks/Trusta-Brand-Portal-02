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
    <form
      method="get"
      className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm"
    >
      <div className="w-44 shrink-0">
        <label htmlFor="sessions-filter-status" className="sr-only">
          Status
        </label>
        <Select name="status" defaultValue={defaults.status ?? "all"}>
          <SelectTrigger id="sessions-filter-status">
            <SelectValue placeholder="All sessions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sessions</SelectItem>
            <SelectItem value="active">Active now</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="shrink-0">
        Apply filters
      </Button>
    </form>
  );
}
