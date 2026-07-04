import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { academyPath } from "@/lib/site/site-mode";

const shopNavLinks = [
  { href: "/", label: "Kitaplar" },
  { href: academyPath("/kurslar"), label: "Academy", external: true },
  { href: "https://thorius.com.tr", label: "Thorius", external: true },
] as const;

export function ShopHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary-100/70 bg-white/90 backdrop-blur-md">
      <Container size="wide" className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Logo variant="compact" />
        </Link>

        <nav className="flex items-center gap-5" aria-label="Mağaza menüsü">
          {shopNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary-700 transition-colors hover:text-primary-950"
              {...("external" in link && link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}
