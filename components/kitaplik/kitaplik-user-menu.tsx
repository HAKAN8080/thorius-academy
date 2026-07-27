"use client";

import Link from "next/link";
import { BookMarked, ChevronDown, LogOut, User } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { kitaplikPath } from "@/lib/site/site-mode";

export function KitaplikUserMenu({
  displayName,
  email,
}: {
  displayName: string;
  email?: string | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary-950 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-900"
          aria-label="Hesap menüsü"
        >
          <User className="h-4 w-4" />
          <span className="max-w-[10rem] truncate">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-80" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {email ? (
          <>
            <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
              {email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/kitaplarim" className="cursor-pointer">
            <BookMarked className="mr-2 h-4 w-4" />
            Kitaplarım
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <input type="hidden" name="redirect" value={kitaplikPath("/")} />
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm text-destructive outline-none hover:bg-accent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış yap
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
