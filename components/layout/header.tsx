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
import { ViewModeSwitch } from "@/components/layout/view-mode-switch";
import { getInstructorPortalUrl } from "@/lib/config/portal-urls";

type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};

const baseNavLinks: NavLink[] = [
  { href: "/kurslar", label: "Kurslar" },
  { href: "/kariyer-yolu/retail-planning", label: "Kariyer Yolu" },
  { href: "/#ecosystem", label: "Koçluk" },
  { href: "/kurumsal", label: "Kurumsal" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/blog", label: "Blog" },
];

function NavItem({
  link,
  className,
  onClick,
}: {
  link: NavLink;
  className: string;
  onClick?: () => void;
}) {
  if (link.external) {
    return (
      <a href={link.href} className={className} onClick={onClick}>
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className} onClick={onClick}>
      {link.label}
    </Link>
  );
}

interface HeaderProps {
  isInstructor?: boolean;
}

export function Header({ isInstructor = false }: HeaderProps) {
  const [open, setOpen] = useState(false);

  const navLinks = isInstructor
    ? [
        ...baseNavLinks,
        {
          href: getInstructorPortalUrl(),
          label: "Eğitmen Paneli",
        },
      ]
    : baseNavLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-100/60 bg-white/80 backdrop-blur-md">
      <Container size="wide" className="flex h-16 items-center justify-between gap-4">
        <Logo variant="compact" showTagline />

        <nav
          className="hidden items-center gap-6 lg:gap-8 xl:flex"
          aria-label="Ana menü"
        >
          {navLinks.map((link) => (
            <NavItem
              key={link.href}
              link={link}
              className="text-sm font-medium text-primary-700 transition-colors hover:text-primary-900"
            />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ViewModeSwitch isInstructor={isInstructor} />
          <AuthButtons
            isInstructor={isInstructor}
            className="flex items-center gap-3"
          />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ViewModeSwitch isInstructor={isInstructor} />
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
                  <NavItem
                    key={link.href}
                    link={link}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-primary-800"
                  />
                ))}
                <hr className="my-2 border-primary-100" />
                <ViewModeSwitch
                  isInstructor={isInstructor}
                  className="w-full"
                  onNavigate={() => setOpen(false)}
                />
                <AuthButtons
                  isInstructor={isInstructor}
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
