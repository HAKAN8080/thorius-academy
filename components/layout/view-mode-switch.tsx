"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GraduationCap, Presentation } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  getInstructorPortalUrl,
  getStudentPortalUrl,
  isInstructorPortalPath,
  isStudentPortalPath,
} from "@/lib/config/portal-urls";
import { useInstructorAccess } from "@/lib/instructor/use-instructor-access";
import { cn } from "@/lib/utils";

interface ViewModeSwitchProps {
  className?: string;
  onNavigate?: () => void;
}

export function ViewModeSwitch({ className, onNavigate }: ViewModeSwitchProps) {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const { isInstructor, loading: loadingInstructor } = useInstructorAccess(user);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoadingUser(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loadingUser || loadingInstructor || !user || !isInstructor) {
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
