import Link from "next/link";
import { BookOpen, Library, User } from "lucide-react";
import { Container } from "@/components/layout/container";
import { KitaplikLogo } from "@/components/kitaplik/kitaplik-logo";
import {
  academyPath,
  getCompanyOrigin,
  kitaplikPath,
} from "@/lib/site/site-mode";
import { createClient } from "@/lib/supabase/server";

const kitaplikNavLinks = [
  { href: "/", label: "Kitaplar" },
  { href: "/kitaplarim", label: "Kitaplarım" },
  { href: getCompanyOrigin(), label: "Thorius", external: true },
  { href: academyPath("/kurslar"), label: "Academy", external: true },
  {
    href: "https://coaching.thorius.com.tr",
    label: "Coaching",
    external: true,
  },
] as const;

export async function KitaplikHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-primary-100/80 bg-white/90 backdrop-blur-md">
      <Container size="wide">
        <div className="flex h-16 items-center justify-between gap-3">
          <KitaplikLogo className="shrink-0" variant="compact" />

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-4 overflow-x-auto px-2 sm:gap-5 md:flex lg:gap-6"
            aria-label="Ana menü"
          >
            {kitaplikNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-sm font-medium text-primary-800 transition hover:text-primary-950"
                {...("external" in link && link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/kitaplarim"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-100 px-3 py-1.5 text-sm font-medium text-primary-800 hover:bg-primary-50 md:hidden"
            >
              <Library className="h-4 w-4" />
              Kitaplarım
            </Link>
            {user ? (
              <Link
                href="/kitaplarim"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-950 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900"
              >
                <User className="h-4 w-4" />
                <span className="max-w-[10rem] truncate">
                  {user.email?.split("@")[0] ?? "Hesabım"}
                </span>
              </Link>
            ) : (
              <Link
                href={academyPath(
                  `/giris?redirect=${encodeURIComponent(kitaplikPath("/"))}`,
                )}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary-950 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900"
              >
                <BookOpen className="h-4 w-4" />
                Giriş
              </Link>
            )}
          </div>
        </div>

        <nav
          className="-mx-1 flex items-center gap-4 overflow-x-auto border-t border-primary-100/70 px-1 pb-3 pt-2 md:hidden"
          aria-label="Site menüsü"
        >
          {kitaplikNavLinks.map((link) => (
            <Link
              key={`mobile-${link.href}`}
              href={link.href}
              className="whitespace-nowrap text-xs font-medium text-primary-700 transition hover:text-primary-950 sm:text-sm"
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
