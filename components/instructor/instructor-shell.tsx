"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Star,
} from "lucide-react";
import { NewCourseButton } from "@/components/instructor/course-builder/new-course-button";
import { SignOutButton } from "@/components/panel/sign-out-button";

interface InstructorShellProps {
  children: React.ReactNode;
  instructorName: string | null;
  instructorEmail: string | null;
}

const navItems = [
  { href: "/instructor/dashboard", label: "Kontrol Paneli", icon: LayoutDashboard },
  { href: "/instructor/courses", label: "Kurslarım", icon: BookOpen },
  { href: "/panel/egitmen", label: "Yorumlar", icon: Star },
  { href: "/panel/kurslarim", label: "Öğrenci Görünümü", icon: GraduationCap },
];

export function InstructorShell({
  children,
  instructorName,
  instructorEmail,
}: InstructorShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-[#0B1E3F]/10 bg-white lg:w-72 lg:border-b-0 lg:border-r">
          <div className="border-b border-primary-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0B1E3F] text-lg font-bold text-[#D4AF37]">
                {(instructorName ?? instructorEmail ?? "E").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#0B1E3F]">
                  {instructorName ?? "Eğitmen"}
                </p>
                <p className="truncate text-xs text-primary-500">
                  {instructorEmail ?? ""}
                </p>
              </div>
            </div>
          </div>

          <nav className="p-3">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-primary-400">
              Eğitmen
            </p>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/instructor/dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "bg-[#0B1E3F] text-[#D4AF37]"
                          : "text-[#0B1E3F] hover:bg-primary-50"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-primary-100 p-3">
            <Link
              href="/panel/kurslarim"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary-600 hover:bg-primary-50"
            >
              <Settings className="h-4 w-4" />
              Ayarlar
            </Link>
            <SignOutButton />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-primary-100 bg-white px-5 py-4 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#D4AF37]">
                Thorius Academy
              </p>
              <h1 className="text-xl font-bold text-[#0B1E3F]">Eğitmen Paneli</h1>
            </div>
            <NewCourseButton />
          </header>
          <main className="p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
