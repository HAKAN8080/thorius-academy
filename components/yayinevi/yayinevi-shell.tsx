"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FilePlus, List } from "lucide-react";

const nav = [
  { href: "/yayinevi", label: "Bağlam Setleri", icon: List },
  { href: "/yayinevi/yeni", label: "Yeni Üret", icon: FilePlus },
];

export function YayineviShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f4f6f9]">
      <div className="border-b border-[#0B1E3F]/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">
              Thorius Yayınevi
            </p>
            <h1 className="text-xl font-bold text-[#0B1E3F]">
              LGS Matematik — TYMM Soru Editörü
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Bağlam temelli çoktan seçmeli soru üretimi (insan onaylı)
            </p>
          </div>
          <nav className="flex gap-2">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/yayinevi" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[#0B1E3F] text-white"
                      : "bg-slate-100 text-[#0B1E3F] hover:bg-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}

export function YayineviEmptyIcon() {
  return <BookOpen className="h-10 w-10 text-slate-300" />;
}
