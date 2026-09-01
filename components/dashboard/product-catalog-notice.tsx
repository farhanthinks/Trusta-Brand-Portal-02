import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Deliberately subtle — this is a "coming soon" placeholder, not a feature.
 * Swap for real product stats once the product-management section exists;
 * everything else on the dashboard should keep working unchanged.
 */
export function ProductCatalogNotice() {
  return (
    <Card className="border-dashed bg-transparent shadow-none">
      <CardContent className="flex items-center gap-3 py-4">
        <Package className="size-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Product catalog management is coming soon — this space will show your product stats.
        </p>
      </CardContent>
    </Card>
  );
}
