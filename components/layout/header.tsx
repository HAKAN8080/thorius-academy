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
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};

const navLinks: NavLink[] = [
  { href: "/kurslar", label: "Kurslar" },
  {
    href: "https://coaching.thorius.com.tr",
    label: "Koçluk",
    external: true,
  },
  { href: "/kurumsal", label: "Kurumsal" },
  { href: "/#hakkimizda", label: "Hakkımızda" },
  { href: "/#blog", label: "Blog" },
];

function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-0.5 font-bold tracking-tight", className)}
      aria-label="Thorius Academy ana sayfa"
    >
      <span className="text-primary-900">THORIUS</span>
      <span className="text-accent-500" aria-hidden="true">
        •
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-100/60 bg-white/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Logo className="text-lg sm:text-xl" />

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Ana menü"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
              {...(link.external
                ? {
                    target: "_blank",
                    rel: "noopener noreferrer",
                    "aria-label": `${link.label} (yeni sekme)`,
                  }
                : {})}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <AuthButtons className="hidden items-center gap-3 md:flex" />

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
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
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-primary-800"
                  {...(link.external
                    ? {
                        target: "_blank",
                        rel: "noopener noreferrer",
                        "aria-label": `${link.label} (yeni sekme)`,
                      }
                    : {})}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-primary-100" />
              <AuthButtons
                className="flex flex-col gap-2"
                onNavigate={() => setOpen(false)}
              />
            </nav>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
