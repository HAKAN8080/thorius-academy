"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
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
}

function HeaderNavItem({
  link,
  className,
  onNavigate,
}: {
  link: HeaderNavLink;
  className: string;
  onNavigate?: () => void;
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

  return (
    <Link href={link.href} className={className} onClick={onNavigate}>
      {link.label}
    </Link>
  );
}

export function Header({ navLinks, authUrls }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-100/60 bg-white/80 backdrop-blur-md">
      <Container size="wide" className="flex h-16 items-center justify-between gap-4">
        <Logo variant="compact" />

        <nav
          className="hidden items-center gap-6 lg:gap-8 xl:flex"
          aria-label="Ana menü"
        >
          {navLinks.map((link) => (
            <HeaderNavItem
              key={link.href}
              link={link}
              className="text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
            />
          ))}
        </nav>

        <div className="hidden md:flex">
          <AuthButtons className="flex items-center gap-3" authUrls={authUrls} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menüyü aç">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4" aria-label="Mobil menü">
                {navLinks.map((link) => (
                  <HeaderNavItem
                    key={link.href}
                    link={link}
                    className="text-base font-medium text-primary-800"
                    onNavigate={() => setOpen(false)}
                  />
                ))}
                <hr className="my-2 border-primary-100" />
                <AuthButtons
                  className="flex flex-col gap-2"
                  authUrls={authUrls}
                  onNavigate={() => setOpen(false)}
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
