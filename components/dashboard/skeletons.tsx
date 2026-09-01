import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ListCardSkeleton({ rows = 4, title = true }: { rows?: number; title?: boolean }) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
      )}
      <CardContent className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}
