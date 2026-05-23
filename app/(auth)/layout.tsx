import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <header className="px-4 py-6 sm:px-8">
        <Link
          href="/"
          className="text-xl font-bold text-primary-900"
          aria-label="Thorius Academy ana sayfa"
        >
          THORIUS<span className="text-accent-500">•</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
