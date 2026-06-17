import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Cpu,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { CompanyHero } from "@/components/marketing/company-hero";
import {
  COMPANY_FOUNDERS,
  CONSULTING_DOMAINS,
  VALUE_CHAIN_STEPS,
} from "@/lib/content/company-model";
import { academyPath } from "@/lib/site/site-mode";

const stepIcons = [ClipboardCheck, Cpu, GraduationCap, Sparkles] as const;

function resolveStepLink(item: (typeof VALUE_CHAIN_STEPS)[number]) {
  if ("external" in item && item.external) {
    return {
      href: item.href,
      target: "_blank" as const,
      rel: "noopener noreferrer" as const,
    };
  }

  if ("academy" in item && item.academy) {
    return {
      href: academyPath(item.href),
      target: "_blank" as const,
      rel: "noopener noreferrer" as const,
    };
  }

  return { href: item.href };
}

export function CompanyHomePage() {
  return (
    <>
      <CompanyHero />

      <section
        id="model"
        className="scroll-mt-24 py-16 md:py-24"
        aria-labelledby="value-chain-heading"
      >
        <Container size="wide">
          <div className="mx-auto mb-14 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent-600">
              Dört adımlı model
            </p>
            <h2
              id="value-chain-heading"
              className="mt-3 text-3xl font-bold text-primary-950 md:text-4xl"
            >
              Audit’ten sürdürülebilir yetkinliğe
            </h2>
            <p className="mt-4 text-lg text-primary-700">
              Danışmanlık ile başlayan, yazılım ve eğitimle tamamlanan,
              koçlukla derinleşen bütüncül yaklaşım.
            </p>
          </div>

          <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {VALUE_CHAIN_STEPS.map((item, index) => {
              const Icon = stepIcons[index] ?? ClipboardCheck;
              const linkProps = resolveStepLink(item);

              return (
                <li
                  key={item.title}
                  className="group flex flex-col rounded-2xl border border-primary-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-950 text-sm font-bold text-accent-400">
                    {item.step}
                  </span>
                  <Icon
                    className="mt-5 h-8 w-8 text-accent-600"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 text-xl font-bold text-primary-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-primary-700">
                    {item.description}
                  </p>
                  <Link
                    {...linkProps}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary-950 group-hover:text-accent-700"
                  >
                    {item.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      <section
        className="border-y border-primary-100 bg-primary-50/80 py-16 md:py-20"
        aria-labelledby="domains-heading"
      >
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h2
                id="domains-heading"
                className="text-3xl font-bold text-primary-950"
              >
                Danışmanlık & audit alanları
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-primary-700">
                Tedarik zinciri, perakende planlama ve İK süreçlerinizi birlikte
                inceliyor; gap analizi ve uygulanabilir yol haritası
                çıkarıyoruz.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                {CONSULTING_DOMAINS.map((domain) => (
                  <li
                    key={domain}
                    className="rounded-xl border border-primary-100 bg-white px-4 py-4 text-center text-sm font-semibold text-primary-900"
                  >
                    {domain}
                  </li>
                ))}
              </ul>
              <Button variant="gold" className="mt-8" asChild>
                <Link href="/kurumsal">Danışmanlık detayları →</Link>
              </Button>
            </div>

            <aside className="rounded-2xl border border-primary-100 bg-white p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-600">
                Kurucular
              </p>
              <ul className="mt-6 space-y-5">
                {COMPANY_FOUNDERS.map((founder) => (
                  <li key={founder.name}>
                    <p className="text-lg font-bold text-primary-950">
                      {founder.name}
                    </p>
                    <p className="text-sm text-primary-600">{founder.role}</p>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-8 w-full" asChild>
                <Link href="/hakkimizda">Hakkımızda →</Link>
              </Button>
            </aside>
          </div>
        </Container>
      </section>

      <section
        className="py-16 md:py-20"
        aria-labelledby="ecosystem-heading"
      >
        <Container size="wide">
          <div className="rounded-3xl bg-primary-950 px-8 py-12 text-white md:px-12 md:py-14">
            <h2 id="ecosystem-heading" className="text-2xl font-bold md:text-3xl">
              Ekosistemimiz
            </h2>
            <p className="mt-3 max-w-2xl text-primary-300">
              Tek çatı altında danışmanlık, AI4U Retail yazılımı, Thorius
              Academy eğitimleri ve koçluk hizmetleri.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="gold" asChild>
                <a
                  href="https://siriusabcx.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AI4U Retail
                </a>
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white hover:text-primary-950"
                asChild
              >
                <a
                  href={academyPath("/kurslar")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Thorius Academy
                </a>
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white hover:text-primary-950"
                asChild
              >
                <a
                  href="https://coaching.thorius.com.tr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Thorius Coaching
                </a>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-primary-100 bg-white py-16">
        <Container
          size="wide"
          className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left"
        >
          <div>
            <h2 className="text-2xl font-bold text-primary-950">
              Dönüşüm yolculuğunuza birlikte başlayalım
            </h2>
            <p className="mt-2 max-w-xl text-primary-700">
              Gap analizi ile başlayın; yazılım, eğitim ve koçlukla ölçülebilir
              sonuç alın.
            </p>
          </div>
          <Button variant="gold" size="lg" asChild>
            <Link href="/kurumsal#iletisim">İletişime geçin</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
