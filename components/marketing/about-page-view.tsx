import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BookOpen, GraduationCap, Lightbulb, Scale, Users } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { CompanyAccreditationsSection } from "@/components/marketing/company-accreditations-section";
import { CompanyProfileSection } from "@/components/marketing/company-profile-section";

const valueIcons = {
  accessibility: BookOpen,
  instructorQuality: GraduationCap,
  ethics: Scale,
  innovation: Lightbulb,
  democratic: Users,
} as const;

type ModelStep = {
  title: string;
  description: string;
};

export async function AboutPageView() {
  const t = await getTranslations("about");
  const modelSteps = t.raw("model.steps") as ModelStep[];
  const domains = t.raw("model.domains") as string[];

  return (
    <>
      <section className="bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-16 text-white md:py-20">
        <Container size="narrow" className="text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
            {t("hero.legalName")}
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">{t("hero.title")}</h1>
          <p className="mt-4 text-base font-medium text-accent-200/90">
            {t("hero.tagline")}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-primary-100">
            {t("hero.subtitle")}
          </p>
        </Container>
      </section>

      <CompanyProfileSection />
      <CompanyAccreditationsSection />

      <section className="py-16 md:py-20" aria-labelledby="mission-heading">
        <Container size="narrow">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2
                id="mission-heading"
                className="mb-4 text-2xl font-bold text-primary-950"
              >
                {t("mission.title")}
              </h2>
              <p className="leading-relaxed text-primary-700">{t("mission.p1")}</p>
              <p className="mt-4 leading-relaxed text-primary-700">
                {t("mission.p2")}
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-2xl font-bold text-primary-950">
                {t("vision.title")}
              </h2>
              <p className="leading-relaxed text-primary-700">{t("vision.p1")}</p>
              <p className="mt-4 leading-relaxed text-primary-700">
                {t("vision.p2")}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section
        className="border-y border-primary-100 bg-white py-16"
        aria-labelledby="model-heading"
      >
        <Container size="narrow">
          <h2
            id="model-heading"
            className="mb-8 text-center text-2xl font-bold text-primary-950"
          >
            {t("model.title")}
          </h2>
          <ol className="space-y-4">
            {modelSteps.map((item, index) => (
              <li
                key={item.title}
                className="flex gap-4 rounded-xl border border-primary-100 bg-primary-50/50 p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B1E3F] text-sm font-bold text-[#D4AF37]">
                  {index + 1}
                </span>
                <div>
                  <p className="font-bold text-primary-950">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-primary-700">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {domains.map((domain) => (
              <li
                key={domain}
                className="rounded-full border border-primary-200 bg-white px-4 py-1.5 text-sm font-medium text-primary-800"
              >
                {domain}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section
        className="border-y border-primary-100 bg-primary-50 py-16"
        aria-labelledby="values-heading"
      >
        <Container size="narrow">
          <h2
            id="values-heading"
            className="mb-10 text-center text-2xl font-bold text-primary-950"
          >
            {t("values.title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {(
              Object.keys(valueIcons) as Array<keyof typeof valueIcons>
            ).map((key) => {
              const Icon = valueIcons[key];
              return (
                <div
                  key={key}
                  className="flex flex-col items-center rounded-2xl border border-primary-100 bg-white p-6 text-center shadow-sm"
                >
                  <Icon
                    className="mb-3 h-8 w-8 text-accent-600"
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-primary-900">
                    {t(`values.items.${key}`)}
                  </span>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container size="narrow" className="text-center">
          <h2 className="text-2xl font-bold text-primary-950">
            {t("cta.title")}
          </h2>
          <p className="mt-4 text-primary-700">{t("cta.subtitle")}</p>
          <Button variant="gold" size="lg" className="mt-8" asChild>
            <Link href="/iletisim">{t("cta.button")}</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
