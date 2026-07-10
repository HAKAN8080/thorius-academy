"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeLabels: Record<AppLocale, string> = {
  tr: "TR",
  en: "EN",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-white/20 bg-white/5 p-0.5 text-xs font-semibold",
        className,
      )}
      role="group"
      aria-label="Dil seçimi"
    >
      {routing.locales.map((item) => {
        const isActive = item === locale;
        const href = `/${item}${pathname === "/" ? "" : pathname}`;

        return (
          <a
            key={item}
            href={href}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              isActive
                ? "bg-accent-500 text-primary-950"
                : "text-primary-100 hover:text-white",
            )}
          >
            {localeLabels[item]}
          </a>
        );
      })}
    </div>
  );
}
