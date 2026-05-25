import Image from "next/image";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import { Container } from "@/components/layout/container";

const coachingFeatures = [
  "7/24 Anlık Erişim",
  "Kişiselleştirilmiş Koçluk Programları",
  "Liderlik ve Kariyer Gelişimi Değerlendirmeleri",
] as const;

export function EcosystemCards() {
  return (
    <section
      id="ecosystem"
      className="py-16 md:py-20"
      aria-labelledby="coaching-promo-heading"
    >
      <Container size="wide">
        <a
          href="https://coaching.thorius.com.tr"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-3xl border border-primary-200 shadow-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
          aria-label="Thorius Coaching'e git (yeni sekme)"
        >
          <div className="grid min-h-[22rem] grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative z-10 flex flex-col justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 p-8 sm:p-10 lg:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
                Thorius Ekosistemi
              </p>
              <h2
                id="coaching-promo-heading"
                className="mt-3 text-3xl font-bold text-white sm:text-4xl"
              >
                Eğitimden Koçluğa Geçin
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-100 sm:text-lg">
                Kurslarla bilgiyi edinin, Thorius Coaching ile kariyerinize
                yön verin. AI destekli koçluk ve mentorluk platformumuzda
                bir sonraki adımınızı planlayın.
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

              <div className="mt-8">
                <span className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-base font-semibold text-primary-950 shadow-md transition-colors group-hover:bg-accent-600">
                  Thorius Coaching&apos;e Git
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </div>

            <div className="relative min-h-[16rem] lg:min-h-full">
              <Image
                src="/images/coaching-promo.png"
                alt=""
                fill
                className="object-cover object-[center_20%]"
                sizes="(max-width: 1024px) 100vw, 45vw"
                priority={false}
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-primary-950/80 via-primary-950/20 to-transparent lg:from-primary-950/70 lg:via-transparent"
                aria-hidden="true"
              />
            </div>
          </div>
        </a>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/kurslar" className="font-medium text-primary-700 hover:underline">
            Kurs kataloğunu inceleyin
          </Link>
          {" "}veya koçluk platformuna geçin.
        </p>
      </Container>
    </section>
  );
}
