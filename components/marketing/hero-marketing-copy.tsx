import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function HeroMarketingCopy() {
  const t = await getTranslations("hero");

  const careerPathLinks = [
    {
      href: "/kariyer-yolu/retail-planning",
      label: t("careerRetail"),
    },
    {
      href: "/kariyer-yolu/insan-kaynaklari",
      label: t("careerHr"),
    },
    {
      href: "/kariyer-yolu/yapay-zeka",
      label: t("careerAi"),
    },
  ] as const;

  const pathSteps = [t("step1"), t("step2"), t("step3")] as const;

  return (
    <div className="order-1 flex flex-col gap-5 sm:gap-6 xl:order-1">
      <div className="space-y-4">
        <h1
          id="hero-heading"
          className="text-balance text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl lg:text-[2.65rem]"
        >
          {t("titleBefore")}{" "}
          <span className="bg-gradient-to-r from-accent-300 via-amber-200 to-accent-400 bg-clip-text text-transparent">
            {t("titleHighlight")}
          </span>
          {t("titleAfter") ? t("titleAfter") : null}
        </h1>

        <p className="max-w-xl text-base text-primary-100/95 sm:text-lg">
          {t("subtitle")}
        </p>

        <ol className="max-w-xl space-y-2.5">
          {pathSteps.map((step, index) => (
            <li
              key={step}
              className="flex gap-3 text-sm leading-snug text-primary-100 sm:text-base"
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-xs font-bold text-accent-300"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-2 pt-1">
          {careerPathLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href as "/"}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-primary-50 transition-colors hover:border-accent-500/50 hover:bg-accent-500/10"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        <Button
          size="lg"
          className="w-full rounded-xl bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600 sm:w-auto"
          asChild
        >
          <Link href="/kariyer-yolu">
            {t("viewCareerPaths")}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full rounded-xl border-2 border-white/80 bg-transparent text-white hover:bg-white hover:text-primary-950 sm:w-auto"
          asChild
        >
          <Link href="/kurslar">{t("allCourses")}</Link>
        </Button>
      </div>
    </div>
  );
}
