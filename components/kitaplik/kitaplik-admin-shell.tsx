"use client";

import { useState } from "react";
import { BookOpen, Users } from "lucide-react";
import { KitaplikBookAdminPanel } from "@/components/kitaplik/kitaplik-book-admin-panel";
import { KitaplikAdminUsersPanel } from "@/components/kitaplik/kitaplik-admin-users-panel";
import type { KitaplikAdminUserSummary } from "@/lib/kitaplik/admin-users";
import type { LibraryBook } from "@/lib/kitaplik/types";
import { cn } from "@/lib/utils";

type AdminTab = "books" | "users";

interface KitaplikAdminShellProps {
  initialBooks: LibraryBook[];
  initialUsers: KitaplikAdminUserSummary[];
}

export function KitaplikAdminShell({
  initialBooks,
  initialUsers,
}: KitaplikAdminShellProps) {
  const [tab, setTab] = useState<AdminTab>("books");

  return (
    <div className="space-y-6">
      <div
        className="inline-flex rounded-full border border-primary-100 bg-white p-1"
        role="tablist"
        aria-label="Admin Panel sekmeleri"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "books"}
          onClick={() => setTab("books")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
            tab === "books"
              ? "bg-primary-950 text-white"
              : "text-primary-800 hover:bg-primary-50",
          )}
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          Kitaplar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "users"}
          onClick={() => setTab("users")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
            tab === "users"
              ? "bg-primary-950 text-white"
              : "text-primary-800 hover:bg-primary-50",
          )}
        >
          <Users className="h-4 w-4" aria-hidden />
          Kullanicilar
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
              tab === "users"
                ? "bg-white/15 text-white"
                : "bg-primary-100 text-primary-800",
            )}
          >
            {initialUsers.length}
          </span>
        </button>
      </div>

      {tab === "books" ? (
        <KitaplikBookAdminPanel initialBooks={initialBooks} />
      ) : (
        <KitaplikAdminUsersPanel initialUsers={initialUsers} />
      )}
    </div>
  );
}
