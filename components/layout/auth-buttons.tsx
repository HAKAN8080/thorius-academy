"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  getInstructorPortalUrl,
  getStudentPortalUrl,
} from "@/lib/config/portal-urls";
import { useInstructorAccess } from "@/lib/instructor/use-instructor-access";

interface AuthButtonsProps {
  onNavigate?: () => void;
  className?: string;
}

export function AuthButtons({ onNavigate, className }: AuthButtonsProps) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isInstructor, loading: loadingInstructor } = useInstructorAccess(user);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading || loadingInstructor) {
    return (
      <div className={className}>
        <div className="h-9 w-24 animate-pulse rounded-md bg-primary-100" />
      </div>
    );
  }

  if (user) {
    const primaryHref = isInstructor
      ? getInstructorPortalUrl()
      : getStudentPortalUrl();
    const primaryLabel = isInstructor ? "Eğitmen Paneli" : "Kurslarım";

    return (
      <div className={className}>
        <Button variant="ghost" asChild>
          <Link href={primaryHref} onClick={onNavigate}>
            {primaryLabel}
          </Link>
        </Button>
        {!isInstructor ? (
          <Button variant="gold" asChild>
            <Link href="/panel" onClick={onNavigate}>
              Panel
            </Link>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <Button variant="ghost" asChild>
        <Link href="/giris" onClick={onNavigate}>
          Giriş Yap
        </Link>
      </Button>
      <Button variant="gold" asChild>
        <Link href="/kayit" onClick={onNavigate}>
          Üye Ol
        </Link>
      </Button>
    </div>
  );
}
