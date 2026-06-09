"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#0B1E3F] hover:bg-gray-50"
      >
        <LogOut className="h-4 w-4" />
        Çıkış yap
      </button>
    </form>
  );
}
