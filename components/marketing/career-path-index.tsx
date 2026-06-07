import Link from "next/link";
import { Brain, LineChart, Map, Users } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { CareerPathNeonCard } from "@/components/marketing/career-path-neon-card";
import { CAREER_PATH_SUMMARIES } from "@/lib/content/career-paths";
import { listCareerPathsFromDb } from "@/lib/career-path/repository";

const pathIcons = {
  "retail-planning": LineChart,
  "insan-kaynaklari": Users,
  "yapay-zeka": Brain,
} as const;

export async function CareerPathIndex() {
  const dbPaths = await listCareerPathsFromDb();
  const summaries =
    dbPaths.length > 0
      ? dbPaths.map((path) => ({
          slug: path.slug,
          title: path.title,
          description: path.subtitle,
          highlight: path.hero_eyebrow,
          href: `/kariyer-yolu/${path.slug}`,
        }))
      : CAREER_PATH_SUMMARIES;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-16 text-white md:py-24">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-[#ff2d55]/15 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-[#c77dff]/15 blur-3xl" />
        </div>

        <Container size="wide" className="relative">
          <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
              Uzmanlık Akademisi
            </p>
            <h1 className="text-4xl font-bold sm:text-5xl">Kariyer Yolları</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-100">
              Kurs kataloğu değil, kariyer sonucu. Her yol gerçek Thorius
              kurslarıyla sıralı adımlarla ilerler.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {summaries.map((summary) => {
              const Icon =
                pathIcons[summary.slug as keyof typeof pathIcons] ?? LineChart;

              return (
                <CareerPathNeonCard
                  key={summary.slug}
                  href={summary.href}
                  title={summary.title}
                  description={summary.description}
                  highlight={summary.highlight}
                  icon={Icon}
                />
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-16">
        <Container size="narrow">
          <div className="rounded-2xl border border-accent-200 bg-accent-50/50 p-6 text-center">
            <Map
              className="mx-auto mb-3 h-8 w-8 text-accent-600"
              aria-hidden="true"
            />
            <p className="text-primary-900">
              Kayıtlı öğrenciler panelde tamamladıkları adımları roadmap
              olarak takip edebilir.
            </p>
            <Button asChild variant="outline" className="mt-4 rounded-xl">
              <Link href="/panel/kariyer-yolu">Kariyer yoluma git</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
