import { BookOpen, CreditCard, LifeBuoy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Static, UI-ready links. Intentionally not <Link>s to real routes — those
// pages (a QR guide, a billing/subscriptions help doc, a support page)
// don't exist yet, and linking to a 404 would be worse than an inert list.
const ITEMS = [
  { icon: BookOpen, label: "QR Code Guide", description: "Learn how static and dynamic QR codes work" },
  { icon: CreditCard, label: "Billing & Subscriptions", description: "How plans, credits and renewals work" },
  { icon: LifeBuoy, label: "Contact Support", description: "Get help from the Trusta team" },
];

export function UsefulInformationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Useful Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm text-muted-foreground"
          >
            <item.icon className="size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="font-medium text-foreground">{item.label}</p>
              <p className="truncate text-xs">{item.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
