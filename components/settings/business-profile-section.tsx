import { Building2, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Brand } from "@/lib/supabase/types";

function initialsFor(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}

/**
 * Read-only by design: brands.status gates self-updates to 'registered' /
 * 'profile_completed' at the RLS level (see the onboarding migration) — an
 * approved/verified brand can't rewrite these fields itself today, and this
 * page shouldn't pretend otherwise with a form that would just fail. A real
 * change-request flow (edit -> admin re-review) is a natural next step, not
 * an "essential" one for this pass.
 */
export function BusinessProfileSection({ brand }: { brand: Brand }) {
  const address = [brand.address, brand.city, brand.state, brand.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-4 text-primary" />
          Business Profile
        </CardTitle>
        <CardDescription>
          Verified details Trusta has on file for your business.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-3">
          <Avatar className="size-14 border">
            {brand.logo_url && <AvatarImage src={brand.logo_url} alt={brand.business_name ?? ""} />}
            <AvatarFallback className="bg-red-50 text-base font-semibold text-primary">
              {initialsFor(brand.business_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{brand.business_name ?? "Unnamed business"}</p>
            <p className="text-sm text-muted-foreground">{brand.business_type ?? "—"}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business type" value={brand.business_type} />
          <Field label="GSTIN / registration number" value={brand.gstin} />
          <Field label="Address" value={address || null} />
          <Field label="Contact number" value={brand.contact_number} />
        </div>

        <Alert>
          <ShieldCheck />
          <AlertDescription>
            These details were verified during onboarding and can&apos;t be edited here. Contact
            support if something needs to change.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
