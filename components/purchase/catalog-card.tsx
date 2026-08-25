import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function CatalogCard({
  href,
  icon,
  title,
  description,
  priceHint,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  priceHint?: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
        <CardContent className="flex h-full flex-col p-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-primary">
            {icon}
          </div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p>
          <div className="mt-4 flex items-center justify-between">
            {priceHint && <span className="text-xs font-medium text-muted-foreground">{priceHint}</span>}
            <span className="flex items-center gap-1 text-sm font-medium text-primary">
              Select
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
