import Link from "next/link";
import { ArrowRight, Brain, LineChart, Map, Users } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
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
      <section className="bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-16 text-white md:py-20">
        <Container size="narrow" className="text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
            Uzmanlık Akademisi
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Kariyer Yolları</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-100">
            Kurs kataloğu değil, kariyer sonucu. Her yol gerçek Thorius
            kurslarıyla adım adım ilerler.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container size="wide">
          <div className="grid gap-6 md:grid-cols-3">
            {summaries.map((summary) => {
              const Icon =
                pathIcons[summary.slug as keyof typeof pathIcons] ?? LineChart;

              return (
                <article
                  key={summary.slug}
                  className="flex flex-col rounded-2xl border border-primary-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-accent-500/10 p-3">
                    <Icon className="h-7 w-7 text-accent-600" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-accent-700">
                    {summary.highlight}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-primary-950">
                    {summary.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {summary.description}
                  </p>
                  <Button
                    asChild
                    className="mt-6 w-full rounded-xl bg-primary-950 text-white hover:bg-primary-900"
                  >
                    <Link href={summary.href}>
                      Yolu incele
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </article>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-accent-200 bg-accent-50/50 p-6 text-center">
            <Map className="mx-auto mb-3 h-8 w-8 text-accent-600" aria-hidden="true" />
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
