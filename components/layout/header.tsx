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

const navLinks = [
  { href: "/kurslar", label: "Kurslar" },
  { href: "/kariyer-yolu", label: "Kariyer Yolu" },
  { href: "/#ecosystem", label: "Koçluk" },
  { href: "/kurumsal", label: "Kurumsal" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/blog", label: "Blog" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-100/60 bg-white/80 backdrop-blur-md">
      <Container size="wide" className="flex h-16 items-center justify-between gap-4">
        <Logo variant="compact" showTagline />

        <nav
          className="hidden items-center gap-6 lg:gap-8 xl:flex"
          aria-label="Ana menü"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex">
          <AuthButtons className="flex items-center gap-3" />
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
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-primary-800"
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
        </div>
      </Container>
    </header>
  );
}
