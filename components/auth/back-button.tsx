import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AuthBackButton() {
  return (
    <Link
      href="/"
      className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      <ArrowLeft className="size-3.5" />
      Back
    </Link>
  );
}
