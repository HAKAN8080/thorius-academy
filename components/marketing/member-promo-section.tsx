import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Gift, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  getSignupCouponCode,
  SIGNUP_DISCOUNT_PERCENT,
} from "@/lib/constants/promo";

export async function MemberPromoSection() {
  const t = await getTranslations("home.memberPromo");
  const couponCode = getSignupCouponCode();

  return (
    <section
      className="border-b border-primary-100 bg-primary-50/60 py-10 md:py-12"
      aria-label={t("ariaLabel")}
    >
      <Container size="wide">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-[#fff8e8] to-amber-100/70 p-6 sm:p-8">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-amber-300/30 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-md">
                <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-200/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-950">
                  <Gift className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("discountBadge")}
                </p>
                <h3 className="text-2xl font-bold text-primary-950 sm:text-3xl">
                  {t("discountTitle", { percent: SIGNUP_DISCOUNT_PERCENT })}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-700 sm:text-base">
                  {t("discountBody", {
                    percent: SIGNUP_DISCOUNT_PERCENT,
                    code: couponCode,
                  })}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-3 sm:items-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-300/80 bg-white text-center shadow-lg">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      {t("discountCircleLabel")}
                    </p>
                    <p className="text-3xl font-black text-amber-700">
                      %{SIGNUP_DISCOUNT_PERCENT}
                    </p>
                    <p className="text-[10px] font-semibold text-amber-900">
                      {t("discountCircleSuffix")}
                    </p>
                  </div>
                </div>
                <Button variant="gold" size="lg" className="rounded-xl" asChild>
                  <Link href="/kayit">
                    {t("discountCta")}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-primary-800 bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 p-6 text-white sm:p-8">
            <div
              className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-accent-500/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-md">
                <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-300">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("freeBadge")}
                </p>
                <h3 className="text-2xl font-bold sm:text-3xl">
                  {t("freeTitle")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-100 sm:text-base">
                  {t("freeBody")}
                </p>
              </div>

              <Button
                size="lg"
                variant="outline"
                className="shrink-0 rounded-xl border-2 border-white/80 bg-transparent text-white hover:bg-white hover:text-primary-950"
                asChild
              >
                <Link href="#ucretsiz-kurslar">
                  {t("freeCta")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
