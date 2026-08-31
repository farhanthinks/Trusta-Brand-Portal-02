import Link from "next/link";
import { ChevronRight, Building2, MapPin, CalendarClock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/format";
import type { BrandActivityProfile } from "@/lib/admin/queries";

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  verification_pending: "bg-amber-100 text-amber-700",
  verified: "bg-blue-100 text-blue-700",
  profile_completed: "bg-secondary text-secondary-foreground",
  registered: "bg-secondary text-secondary-foreground",
};

function initialsFor(name: string | null) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function BrandActivityHeader({ profile }: { profile: BrandActivityProfile }) {
  const { brand, email } = profile;
  const location = [brand.city, brand.state].filter(Boolean).join(", ");

  return (
    <div className="mb-6">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/admin/logs" className="hover:text-foreground">
          Activity Logs
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{brand.business_name ?? "Unnamed business"}</span>
      </nav>

      <div className="rounded-xl border bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="size-14 border">
            {brand.logo_url && <AvatarImage src={brand.logo_url} alt={brand.business_name ?? ""} />}
            <AvatarFallback className="bg-red-50 text-lg font-semibold text-primary">
              {initialsFor(brand.business_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight">
              {brand.business_name ?? "Unnamed business"}
            </h1>
            {email && <p className="truncate text-sm text-muted-foreground">{email}</p>}
          </div>
          <span
            className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${
              STATUS_STYLES[brand.status] ?? "bg-secondary text-secondary-foreground"
            }`}
          >
            {brand.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-sm text-muted-foreground">
          {brand.business_type && (
            <span className="flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              {brand.business_type}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              {location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5" />
            Member since {formatDate(brand.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}
