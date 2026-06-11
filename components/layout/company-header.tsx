"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Container } from "@/components/layout/container";
import { CompanyLogo } from "@/components/layout/company-logo";
import type { CompanyNavLink } from "@/lib/site/site-mode";

interface CompanyHeaderProps {
  navLinks: CompanyNavLink[];
  academyHref: string;
}

function NavLinkItem({
  link,
  onNavigate,
}: {
  link: CompanyNavLink;
  onNavigate?: () => void;
}) {
  const className =
    "text-sm font-medium text-primary-700 transition-colors hover:text-primary-950";

  if (link.external) {
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

export function CompanyHeader({ navLinks, academyHref }: CompanyHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-100/70 bg-white/90 backdrop-blur-md">
      <Container
        size="wide"
        className="flex h-[4.25rem] items-center justify-between gap-4"
      >
        <CompanyLogo showTagline={false} />

        <nav
          className="hidden items-center gap-5 xl:gap-6 lg:flex"
          aria-label="Ana menü"
        >
          {navLinks.map((link) => (
            <NavLinkItem key={`${link.href}-${link.label}`} link={link} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" size="sm" asChild>
            <a href={academyHref} target="_blank" rel="noopener noreferrer">
              Academy
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </Button>
          <Button variant="gold" size="sm" asChild>
            <Link href="/kurumsal#iletisim">Görüşme talep et</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Menüyü aç"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <SheetHeader>
              <SheetTitle>
                <CompanyLogo />
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-4" aria-label="Mobil menü">
              {navLinks.map((link) => (
                <NavLinkItem
                  key={`${link.href}-${link.label}`}
                  link={link}
                  onNavigate={() => setOpen(false)}
                />
              ))}
              <hr className="my-2 border-primary-100" />
              <Button variant="outline" asChild>
                <a href={academyHref} target="_blank" rel="noopener noreferrer">
                  Academy&apos;ye git
                </a>
              </Button>
              <Button variant="gold" asChild>
                <Link href="/kurumsal#iletisim" onClick={() => setOpen(false)}>
                  Görüşme talep et
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
