"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SIGNUP_DISCOUNT_PERCENT } from "@/lib/constants/promo";

function PromoBannerItem() {
  const t = useTranslations("promo");
  const promoText = t("text", { percent: SIGNUP_DISCOUNT_PERCENT });

  return (
    <span className="inline-flex items-center gap-3">
      <span aria-hidden="true">🎁</span>
      <span>{promoText}</span>
      <Link
        href="/kayit"
        className="rounded-full bg-primary-950 px-3 py-0.5 text-xs font-bold text-accent-400 transition-colors hover:bg-primary-900 sm:text-sm"
      >
        {t("cta")}
      </Link>
    </span>
  );
}

export function PromoBanner() {
  const t = useTranslations("promo");
  const promoText = t("text", { percent: SIGNUP_DISCOUNT_PERCENT });

  return (
    <div
      className="relative overflow-hidden bg-accent-500 py-2.5 text-primary-950"
      role="region"
      aria-label={t("ariaLabel")}
    >
      <p className="sr-only">{promoText}</p>
      <div
        className="promo-marquee-track flex w-max items-center gap-12 whitespace-nowrap px-4 text-sm font-semibold sm:text-base"
        aria-hidden="true"
      >
        <PromoBannerItem />
        <PromoBannerItem />
      </div>
    </div>
  );
}
