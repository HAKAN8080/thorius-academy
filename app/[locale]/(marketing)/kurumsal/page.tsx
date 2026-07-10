import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Users, LineChart, Shield } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CorporateContactForm } from "@/components/marketing/corporate-contact-form";
import { CompanyConsultingPage } from "@/components/marketing/company-consulting-page";
import { isCompanySiteHost } from "@/lib/site/site-mode";

const benefitIcons = [Users, LineChart, Shield] as const;

type BenefitItem = {
  title: string;
  description: string;
};

type PackageItem = {
  name: string;
  description: string;
  features: string[];
  price: string;
  highlighted?: boolean;
};

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "corporate" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function KurumsalPage() {
  if (isCompanySiteHost(headers().get("host"))) {
    return <CompanyConsultingPage />;
  }

  const t = await getTranslations("corporate");
  const benefits = t.raw("benefits.items") as BenefitItem[];
  const packages = t.raw("packages.items") as PackageItem[];

  return (
    <>
      <section className="bg-gradient-to-br from-primary-900 to-primary-700 py-20 text-white">
        <Container size="narrow" className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">{t("hero.title")}</h1>
          <p className="mt-6 text-lg text-primary-100">{t("hero.subtitle")}</p>
          <Button variant="gold" size="lg" className="mt-10" asChild>
            <Link href="#iletisim">{t("hero.cta")}</Link>
          </Button>
        </Container>
      </section>

      <section className="py-16" aria-labelledby="benefits-heading">
        <Container>
          <h2
            id="benefits-heading"
            className="text-center text-3xl font-bold text-primary-900"
          >
            {t("benefits.title")}
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {benefits.map(({ title, description }, index) => {
              const Icon = benefitIcons[index] ?? Users;
              return (
                <Card key={title} className="border-primary-100 text-center">
                  <CardHeader>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-accent-100">
                      <Icon
                        className="h-7 w-7 text-accent-700"
                        aria-hidden="true"
                      />
                    </div>
                    <CardTitle className="text-primary-900">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="paketler" className="bg-primary-50/50 py-16">
        <Container>
          <h2 className="text-center text-3xl font-bold text-primary-900">
            {t("packages.title")}
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={
                  pkg.highlighted
                    ? "border-accent-500 shadow-lg ring-2 ring-accent-500/20"
                    : "border-primary-100"
                }
              >
                <CardHeader>
                  <CardTitle className="text-primary-900">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-2xl font-bold text-primary-900">
                    {pkg.price}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="gold" className="w-full" asChild>
                    <Link href="#iletisim">{t("packages.requestQuote")}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section id="iletisim" className="py-16">
        <Container className="max-w-xl">
          <h2 className="text-center text-2xl font-bold text-primary-900">
            {t("formSection.title")}
          </h2>
          <p className="mt-2 text-center text-primary-700">
            {t("formSection.subtitle")}
          </p>
          <CorporateContactForm />
        </Container>
      </section>
    </>
  );
}
