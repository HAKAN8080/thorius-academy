"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface AuthButtonsProps {
  onNavigate?: () => void;
  className?: string;
  tone?: "light" | "dark";
  authUrls?: {
    loginHref: string;
    registerHref: string;
    panelHref: string;
  };
}

export function AuthButtons({
  onNavigate,
  className,
  tone = "light",
  authUrls,
}: AuthButtonsProps) {
  const loginHref = authUrls?.loginHref ?? "/giris";
  const registerHref = authUrls?.registerHref ?? "/kayit";
  const panelHref = authUrls?.panelHref ?? "/panel";
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
      }
    }, 6000);

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;

        if (error) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(data.session?.user ?? null);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className={className}>
        <div
          className={
            tone === "dark"
              ? "h-9 w-24 animate-pulse rounded-md bg-white/10"
              : "h-9 w-24 animate-pulse rounded-md bg-primary-100"
          }
        />
      </div>
    );
  }

  if (user) {
    return (
      <div className={className}>
        <Button variant="gold" asChild>
          <Link href={panelHref} onClick={onNavigate} prefetch={false}>
            Panelim
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        variant="ghost"
        asChild
        className={
          tone === "dark"
            ? "text-primary-100 hover:bg-white/10 hover:text-white"
            : undefined
        }
      >
        <Link href={loginHref} onClick={onNavigate}>
          Giriş Yap
        </Link>
      </Button>
      <Button variant="gold" asChild>
        <Link href={registerHref} onClick={onNavigate}>
          Üye Ol
        </Link>
      </Button>
    </div>
  );
}
