"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Link as LocaleLink } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Container } from "@/components/layout/container";
import { AuthButtons } from "@/components/layout/auth-buttons";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";

export interface HeaderNavLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface HeaderAuthUrls {
  loginHref: string;
  registerHref: string;
  panelHref: string;
}

interface HeaderProps {
  navLinks: HeaderNavLink[];
  authUrls?: HeaderAuthUrls;
  localized?: boolean;
  showLocaleSwitcher?: boolean;
}

function HeaderNavItem({
  link,
  className,
  onNavigate,
  localized,
}: {
  link: HeaderNavLink;
  className: string;
  onNavigate?: () => void;
  localized?: boolean;
}) {
  if (link.external || link.href.startsWith("http")) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onNavigate}
      >
        {link.label}
      </a>
    );
  }

  if (localized) {
    return (
      <LocaleLink
        href={link.href as "/"}
        className={className}
        onClick={onNavigate}
      >
        {link.label}
      </LocaleLink>
    );
  }

  return (
    <Link href={link.href} className={className} onClick={onNavigate}>
      {link.label}
    </Link>
  );
}

export function Header({
  navLinks,
  authUrls,
  localized = false,
  showLocaleSwitcher = false,
}: HeaderProps) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[var(--thorius-logo-bg)]">
      <Container size="wide" className="flex h-16 items-center justify-between gap-4">
        <Logo variant="compact" localized={localized} />

        <nav
          className="hidden items-center gap-6 lg:gap-8 xl:flex"
          aria-label={t("mainMenu")}
        >
          {navLinks.map((link) => (
            <HeaderNavItem
              key={link.href}
              link={link}
              className="text-sm font-medium text-primary-100 transition-colors hover:text-white"
              localized={localized}
            />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {showLocaleSwitcher ? <LanguageSwitcher /> : null}
          <AuthButtons
            className="flex items-center gap-3"
            authUrls={authUrls}
            tone="dark"
            localized={localized}
          />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {showLocaleSwitcher ? <LanguageSwitcher /> : null}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("openMenu")}
                className="text-primary-100 hover:bg-white/10 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              overlayClassName="z-[105] bg-black/65"
              className="z-[110] w-[min(100vw,20rem)] border-l border-white/10 bg-[#0a0e27] p-6 text-white shadow-2xl [&>button]:text-white [&>button]:hover:bg-white/10 [&>button]:hover:text-white"
            >
              <SheetHeader>
                <SheetTitle className="text-white">
                  <Logo localized={localized} />
                </SheetTitle>
              </SheetHeader>
              <nav
                className="mt-8 flex flex-col gap-4"
                aria-label={t("mobileMenu")}
              >
                {navLinks.map((link) => (
                  <HeaderNavItem
                    key={link.href}
                    link={link}
                    className="text-base font-medium text-primary-50 transition-colors hover:text-accent-400"
                    onNavigate={() => setOpen(false)}
                    localized={localized}
                  />
                ))}
                <hr className="my-2 border-white/15" />
                <AuthButtons
                  className="flex flex-col gap-2"
                  authUrls={authUrls}
                  onNavigate={() => setOpen(false)}
                  localized={localized}
                  tone="dark"
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
