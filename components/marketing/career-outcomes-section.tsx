import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { RETAIL_PLANNING_OUTCOMES } from "@/lib/content/retail-planning-career-path";

interface CareerOutcomesSectionProps {
  className?: string;
}

export function CareerOutcomesSection({
  className,
}: CareerOutcomesSectionProps) {
  return (
    <section
      className={className}
      aria-labelledby="career-outcomes-heading"
    >
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-14">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-accent-600">
              Mezunların kazanımları
            </p>
            <h2
              id="career-outcomes-heading"
              className="text-3xl font-bold text-primary-950 md:text-4xl"
            >
              Kurs değil,{" "}
              <span className="text-primary-700">kariyer sonucu</span> satın
              alırsınız
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Thorius Academy&apos;de amaç video izlemek değil; perakende
              planlamada iş yapabilir hale gelmek. Retail Planning kariyer
              yolu bu yetkinlikleri sırayla inşa eder.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 rounded-xl bg-primary-950 text-white hover:bg-primary-900"
            >
              <Link href="/kariyer-yolu/retail-planning">
                Retail Planning yolunu gör
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {RETAIL_PLANNING_OUTCOMES.map((outcome) => (
              <li
                key={outcome}
                className="flex items-start gap-3 rounded-2xl border border-primary-100 bg-white p-4 shadow-sm"
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-accent-600"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium leading-snug text-primary-900">
                  {outcome}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
