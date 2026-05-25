import Link from "next/link";
import { ArrowRight, Check, ExternalLink, GraduationCap, Users } from "lucide-react";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

const academyFeatures = [
  "65+ Premium Kurs",
  "Sektör Uzmanı Eğitmenler",
  "KVKK Uyumlu Sertifika",
] as const;

const coachingFeatures = [
  "7/24 Anlık Erişim",
  "Kişiselleştirilmiş Koçluk Programları",
  "Liderlik ve Kariyer Gelişimi Değerlendirmeleri",
] as const;

const cardHover =
  "transition duration-300 hover:-translate-y-1 hover:shadow-xl";

export function EcosystemCards() {
  return (
    <section
      id="ecosystem"
      className="py-16 md:py-20"
      aria-labelledby="ecosystem-heading"
    >
      <Container size="wide">
        <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="ecosystem-heading"
              className="text-3xl font-bold text-primary-900"
            >
              Thorius Ekosistemi
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Eğitimden koçluğa — profesyonel gelişiminiz için iki platform,
              tek çatı altında. Hemen keşfedin ve size uygun olanı seçin.
            </p>
          </div>
          <p className="text-sm font-medium text-primary-600">
            Aşağıdaki kartlardan platforma geçiş yapabilirsiniz →
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <Link
            href="/kurslar"
            className={cn(
              "group block rounded-2xl border-2 border-primary-100 bg-gradient-to-br from-primary-50 to-accent-50 p-8",
              cardHover,
            )}
            aria-label="Thorius AI Academy kurslarına git"
          >
            <div className="flex items-start justify-between gap-4">
              <GraduationCap
                className="h-12 w-12 text-accent-500"
                aria-hidden="true"
              />
              <ArrowRight
                className="h-6 w-6 shrink-0 text-accent-600 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-primary-900">
              Thorius AI Academy
            </h3>
            <p className="mt-1 text-sm font-medium text-primary-700">
              Premium B2B Perakende Akademisi
            </p>
            <p className="mt-4 text-primary-700">
              Sektörün en deneyimli isimlerinden, AI ile zenginleştirilmiş
              eğitim deneyimi. Planlama, AI, liderlik ve daha fazlası.
            </p>
            <ul
              className="mt-6 space-y-3"
              aria-label="Thorius Academy özellikleri"
            >
              {academyFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-primary-800"
                >
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent-500"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <span className="mt-8 inline-flex items-center gap-2 font-semibold text-accent-700 group-hover:underline">
              Kurslara Göz At
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>

          <a
            href="https://coaching.thorius.com.tr"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group block rounded-2xl border-2 border-primary-800 bg-gradient-to-br from-primary-900 to-primary-950 p-8 text-white",
              cardHover,
            )}
            aria-label="Thorius Coaching'e git (yeni sekme)"
          >
            <div className="flex items-start justify-between gap-4">
              <Users className="h-12 w-12 text-accent-400" aria-hidden="true" />
              <ExternalLink
                className="h-6 w-6 shrink-0 text-accent-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </div>
            <h3 className="mt-6 text-2xl font-bold">Thorius Coaching</h3>
            <p className="mt-1 text-sm font-medium text-primary-100">
              AI Destekli Koçluk ve Mentorluk
            </p>
            <p className="mt-4 text-primary-50">
              Uluslararası standartlarda kişisel koçluk ve mentorluk. Kariyer,
              liderlik ve kişisel gelişiminiz için yanınızda.
            </p>
            <ul
              className="mt-6 space-y-3"
              aria-label="Thorius Coaching özellikleri"
            >
              {coachingFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-primary-50"
                >
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent-500"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <span className="mt-8 inline-flex items-center gap-2 font-semibold text-accent-400 group-hover:underline">
              Koçluğa Başla
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </span>
          </a>
        </div>
      </Container>
    </section>
  );
}
