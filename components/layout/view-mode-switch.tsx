"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Presentation } from "lucide-react";
import {
  getInstructorPortalUrl,
  getStudentPortalUrl,
  isInstructorPortalPath,
  isStudentPortalPath,
} from "@/lib/config/portal-urls";
import { cn } from "@/lib/utils";

interface ViewModeSwitchProps {
  isInstructor: boolean;
  className?: string;
  onNavigate?: () => void;
}

export function ViewModeSwitch({
  isInstructor,
  className,
  onNavigate,
}: ViewModeSwitchProps) {
  const pathname = usePathname();

  if (!isInstructor) {
    return null;
  }

  const studentActive = isStudentPortalPath(pathname);
  const instructorActive = isInstructorPortalPath(pathname);
  const instructorUrl = getInstructorPortalUrl();
  const studentUrl = getStudentPortalUrl();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-primary-200 bg-white p-0.5",
        className,
      )}
      role="group"
      aria-label="Görünüm değiştir"
    >
      <Link
        href={instructorUrl}
        onClick={onNavigate}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm",
          instructorActive
            ? "bg-primary-950 text-white shadow-sm"
            : "text-primary-700 hover:bg-primary-50 hover:text-primary-900",
        )}
        aria-current={instructorActive ? "page" : undefined}
      >
        <Presentation className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Eğitmen görünümü</span>
        <span className="sm:hidden">Eğitmen</span>
      </Link>

      <Link
        href={studentUrl}
        onClick={onNavigate}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm",
          studentActive
            ? "bg-primary-950 text-white shadow-sm"
            : "text-primary-700 hover:bg-primary-50 hover:text-primary-900",
        )}
        aria-current={studentActive ? "page" : undefined}
      >
        <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Öğrenci görünümü</span>
        <span className="sm:hidden">Öğrenci</span>
      </Link>
    </div>
  );
}
