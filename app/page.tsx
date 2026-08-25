import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, QrCode, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentBrand, getCurrentProfile, getCurrentUser } from "@/lib/supabase/queries";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    const profile = await getCurrentProfile();
    if (profile?.is_admin) {
      redirect("/admin");
    }

    const brand = await getCurrentBrand();
    if (brand?.status === "approved") {
      redirect("/dashboard");
    }
    redirect("/onboarding");
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
            T
          </span>
          <span className="text-xl font-semibold tracking-tight">Trusta</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-4 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-primary">
          Brand onboarding, made simple
        </span>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Get your brand verified and start selling QR trust
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Register, verify your business, and get approved — then unlock QR
          codes and subscription plans built for brands that need trust at
          scale.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/sign-up">
            <Button size="lg">Create your account</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              I already have an account
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={<ShieldCheck className="size-6 text-primary" />}
            title="Verified onboarding"
            description="A guided 5-step flow from signup to approval."
          />
          <FeatureCard
            icon={<QrCode className="size-6 text-primary" />}
            title="Static & dynamic QR"
            description="Buy QR credits in the tiers your business needs."
          />
          <FeatureCard
            icon={<Layers className="size-6 text-primary" />}
            title="Subscription plans"
            description="Bundle QR credits and features on one plan."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 text-left shadow-sm">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
