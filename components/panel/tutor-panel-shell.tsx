"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Plus, Star } from "lucide-react";
import { NewCourseButton } from "@/components/instructor/course-builder/new-course-button";
import { SignOutButton } from "@/components/panel/sign-out-button";
import {
  instructorPanelNav,
  isPanelNavActive,
  studentPanelNav,
  type PanelNavItem,
} from "@/lib/panel/tutor-panel-nav";
import { cn } from "@/lib/utils";

interface TutorPanelShellProps {
  children: React.ReactNode;
  userEmail: string | null;
  userName: string | null;
  avatarUrl: string | null;
  isInstructor: boolean;
}

function NavLink({
  item,
  isInstructor,
  pathname,
}: {
  item: PanelNavItem;
  isInstructor: boolean;
  pathname: string;
}) {
  const locked = item.requiresInstructor && !isInstructor;
  const hidden = item.hideForInstructor && isInstructor;
  const inactive = item.disabled || locked;

  if (hidden) {
    return null;
  }
  const active = item.href ? isPanelNavActive(pathname, item.href) : false;

  const className = cn(
    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
    inactive
      ? "cursor-not-allowed text-gray-400"
      : active
        ? "border-l-4 border-[#D4AF37] bg-[#eef4ff] text-[#0B1E3F]"
        : "border-l-4 border-transparent text-[#0B1E3F] hover:bg-gray-50",
  );

  const content = (
    <>
      <item.icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </>
  );

  if (inactive) {
    return (
      <span
        className={className}
        title={locked ? "Eğitmen hesabı gerekli" : item.disabledReason}
      >
        {content}
      </span>
    );
  }

  if (item.externalHref) {
    return (
      <a
        href={item.externalHref}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={item.disabledReason}
      >
        {content}
      </a>
    );
  }

  if (!item.href) {
    return null;
  }

  return (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}

export function TutorPanelShell({
  children,
  userEmail,
  userName,
  avatarUrl,
  isInstructor,
}: TutorPanelShellProps) {
  const pathname = usePathname();
  const displayName = userName ?? userEmail ?? "Kullanıcı";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center justify-center gap-4 sm:justify-start">
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#0B1E3F]">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-[#D4AF37]">
                  {initial}
                </div>
              )}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-base font-bold uppercase tracking-wide text-[#0B1E3F]">
                {displayName}
              </p>
              <div className="mt-1 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-4 w-4 text-gray-300"
                    strokeWidth={1.5}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              className="relative ml-2 rounded-full p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Bildirimler"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isInstructor ? (
              <>
                <button
                  type="button"
                  disabled
                  className="hidden rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-400 sm:inline-flex"
                  title="Yakında"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  New Bundle
                </button>
                <NewCourseButton className="rounded-md px-4 py-2 text-sm" />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-gray-200 bg-white lg:w-[260px] lg:border-b-0 lg:border-r">
          <nav className="space-y-1 p-3">
            {studentPanelNav.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                isInstructor={isInstructor}
                pathname={pathname}
              />
            ))}
          </nav>

          <div className="mx-3 border-t border-gray-200" />

          <div className="p-3">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Eğitmenlik
            </p>
            <nav className="space-y-1">
              {instructorPanelNav.map((item) => (
                <NavLink
                  key={item.id}
                  item={item}
                  isInstructor={isInstructor}
                  pathname={pathname}
                />
              ))}
            </nav>
          </div>

          <div className="border-t border-gray-200 p-3">
            <SignOutButton />
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-[#f8f9fb] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
