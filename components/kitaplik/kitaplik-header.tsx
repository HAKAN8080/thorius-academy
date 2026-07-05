import Link from "next/link";
import { BookOpen, Library } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { academyPath, kitaplikPath } from "@/lib/site/site-mode";

const NAV = [
  { href: "/", label: "Kitaplar" },
  { href: "/kitaplarim", label: "Kitaplarım" },
] as const;

export function KitaplikHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary-100/80 bg-white/90 backdrop-blur-md">
      <Container size="wide">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <Logo variant="compact" />
          </Link>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Ana menü">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-primary-800 transition hover:text-primary-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/kitaplarim"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-100 px-3 py-1.5 text-sm font-medium text-primary-800 hover:bg-primary-50 md:hidden"
            >
              <Library className="h-4 w-4" />
              Kitaplarım
            </Link>
            <Link
              href={academyPath(
                `/giris?redirect=${encodeURIComponent(kitaplikPath("/"))}`,
              )}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-950 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900"
            >
              <BookOpen className="h-4 w-4" />
              Giriş
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
