import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-50 via-white to-white px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
          T
        </span>
        <span className="text-xl font-semibold tracking-tight">Trusta</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
