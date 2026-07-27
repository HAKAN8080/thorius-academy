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
      <DropdownMenuContent
        align="end"
        className="w-56 border-[#D4AF37] bg-[#D4AF37] p-1.5 text-primary-950 shadow-lg"
      >
        {email ? (
          <>
            <DropdownMenuLabel className="truncate font-normal text-primary-900/80">
              {email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary-950/20" />
          </>
        ) : null}
        <DropdownMenuItem asChild className="focus:bg-primary-950/10 focus:text-primary-950">
          <Link href="/kitaplarim" className="cursor-pointer font-medium">
            <BookMarked className="mr-2 h-4 w-4" />
            Kitaplarım
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-primary-950/20" />
        <form action={signOut}>
          <input type="hidden" name="redirect" value={kitaplikPath("/")} />
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm font-semibold text-primary-950 outline-none hover:bg-primary-950/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış yap
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
