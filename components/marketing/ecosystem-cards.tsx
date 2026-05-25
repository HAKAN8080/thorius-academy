import Link from "next/link";
import { Check, GraduationCap, Users } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const academyFeatures = [
  "65+ Premium Kurs",
  "Sektör Uzmanı Eğitmenler",
  "KVKK Uyumlu Sertifika",
] as const;

const coachingFeatures = [
  "7/24 Anlık Erişim",
  "GROW Metodu + ICF Standartları",
  "Big Five, Bass-Avolio Değerlendirmeleri",
] as const;

const cardHover =
  "transition duration-300 hover:scale-105 hover:shadow-xl";

export function EcosystemCards() {
  return (
    <section className="py-20" aria-labelledby="ecosystem-heading">
      <Container>
        <h2 id="ecosystem-heading" className="mb-3 text-3xl font-bold text-primary-900">
          Thorius Ekosistemi
        </h2>
        <p className="mb-12 text-muted-foreground">
          Profesyonel gelişiminiz için iki güçlü platform
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <article
            className={cn(
              "rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-accent-50 p-8",
              cardHover
            )}
            aria-label="Thorius Academy — Premium B2B Perakende Akademisi"
          >
            <GraduationCap
              className="h-12 w-12 text-accent-500"
              aria-hidden="true"
            />
            <h3 className="mt-6 text-2xl font-bold text-primary-900">
              Thorius AI Academy
            </h3>
            <p className="mt-1 text-sm font-medium text-primary-700">
              Bilge Baykuş ile Premium B2B Perakende Akademisi
            </p>
            <p className="mt-4 text-primary-700">
              Sektörün en deneyimli isimlerinden, AI ile zenginleştirilmiş eğitim
              deneyimi. Planlama, AI, liderlik ve daha fazlası.
            </p>
            <ul className="mt-6 space-y-3" aria-label="Thorius Academy özellikleri">
              {academyFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-primary-800">
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent-500"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button variant="gold" className="mt-8 rounded-xl" asChild>
              <Link href="/kurslar" aria-label="Kurslara göz at">
                Kurslara Göz At
              </Link>
            </Button>
          </article>

          <article
            className={cn(
              "rounded-2xl bg-gradient-to-br from-primary-900 to-primary-950 p-8 text-white",
              cardHover
            )}
            aria-label="Thorius Coaching — AI destekli koçluk ve mentorluk"
          >
            <Users
              className="h-12 w-12 text-primary-700"
              aria-hidden="true"
            />
            <h3 className="mt-6 text-2xl font-bold">Thorius Coaching</h3>
            <p className="mt-1 text-sm font-medium text-primary-100">
              AI Destekli Koçluk ve Mentorluk
            </p>
            <p className="mt-4 text-primary-50">
              Uluslararası standartlarda kişisel koçluk ve mentorluk. Kariyer,
              liderlik ve kişisel gelişiminiz için yanınızda.
            </p>
            <ul className="mt-6 space-y-3" aria-label="Thorius Coaching özellikleri">
              {coachingFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-primary-50">
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-accent-500"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              variant="gold"
              className="mt-8 rounded-xl"
              asChild
            >
              <a
                href="https://coaching.thorius.com.tr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Thorius Coaching'e git (yeni sekme)"
              >
                Koçluğa Başla
              </a>
            </Button>
          </article>
        </div>
      </Container>
    </section>
  );
}
