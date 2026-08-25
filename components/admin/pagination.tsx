import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminPagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Showing {from}&ndash;{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          asChild={page > 1}
          variant="outline"
          size="sm"
          disabled={page <= 1}
          className={cn(page <= 1 && "pointer-events-none opacity-50")}
        >
          {page > 1 ? (
            <Link href={hrefFor(page - 1)}>
              <ChevronLeft className="size-4" />
              Previous
            </Link>
          ) : (
            <span>
              <ChevronLeft className="size-4" />
              Previous
            </span>
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          asChild={page < totalPages}
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          className={cn(page >= totalPages && "pointer-events-none opacity-50")}
        >
          {page < totalPages ? (
            <Link href={hrefFor(page + 1)}>
              Next
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span>
              Next
              <ChevronRight className="size-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
