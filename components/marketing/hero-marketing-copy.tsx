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
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="space-y-2.5">
        <h1
          id="hero-heading"
          className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl lg:text-[2rem]"
        >
          {t("titleBefore")}{" "}
          <span className="bg-gradient-to-r from-accent-300 via-amber-200 to-accent-400 bg-clip-text text-transparent">
            {t("titleHighlight")}
          </span>
          {t("titleAfter") ? t("titleAfter") : null}
        </h1>

        <p className="max-w-xl text-sm text-primary-100/95 sm:text-base">
          {t("subtitle")}
        </p>

        <ol className="max-w-xl space-y-1.5">
          {pathSteps.map((step, index) => (
            <li
              key={step}
              className="flex gap-2.5 text-xs leading-snug text-primary-100 sm:text-sm"
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-[10px] font-bold text-accent-300"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {careerPathLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href as "/"}
              className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-primary-50 transition-colors hover:border-accent-500/50 hover:bg-accent-500/10"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
        <Button
          size="default"
          className="w-full rounded-xl bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600 sm:w-auto"
          asChild
        >
          <Link href="/kariyer-yolu">
            {t("viewCareerPaths")}
            <ArrowRight className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
        <Button
          size="default"
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
