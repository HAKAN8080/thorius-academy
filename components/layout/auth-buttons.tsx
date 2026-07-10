"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { User } from "@supabase/supabase-js";
import { Link as LocaleLink } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface AuthButtonsProps {
  onNavigate?: () => void;
  className?: string;
  tone?: "light" | "dark";
  localized?: boolean;
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
  localized = false,
  authUrls,
}: AuthButtonsProps) {
  const t = useTranslations("auth");
  const loginHref = authUrls?.loginHref ?? "/giris";
  const registerHref = authUrls?.registerHref ?? "/kayit";
  const panelHref = authUrls?.panelHref ?? "/panel";
  const loginIsExternal = loginHref.startsWith("http");
  const registerIsExternal = registerHref.startsWith("http");
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
            {t("panel")}
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
        {loginIsExternal || !localized ? (
          <Link href={loginHref} onClick={onNavigate}>
            {t("login")}
          </Link>
        ) : (
          <LocaleLink href="/giris" onClick={onNavigate}>
            {t("login")}
          </LocaleLink>
        )}
      </Button>
      <Button variant="gold" asChild>
        {registerIsExternal || !localized ? (
          <Link href={registerHref} onClick={onNavigate}>
            {t("register")}
          </Link>
        ) : (
          <LocaleLink href="/kayit" onClick={onNavigate}>
            {t("register")}
          </LocaleLink>
        )}
      </Button>
    </div>
  );
}
