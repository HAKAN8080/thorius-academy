import Link from "next/link";
import {
  BookOpen,
  Megaphone,
  RefreshCw,
  Search,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { GuideBlocks } from "@/components/marketing/instructor-guide/guide-blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  instructorGuideChapters,
  instructorGuideToc,
} from "@/lib/content/instructor-guide";
import { cn } from "@/lib/utils";

const chapterIcons: Record<number, LucideIcon> = {
  1: Search,
  2: Target,
  3: Megaphone,
  4: BookOpen,
  5: RefreshCw,
};

export function InstructorGuideView() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-16 text-white md:py-20">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[min(100%,40rem)] -translate-x-1/2 rounded-full bg-accent-500/15 blur-3xl"
          aria-hidden="true"
        />
        <Container className="relative">
          <Badge
            variant="outline"
            className="mb-4 border-accent-500/40 bg-accent-500/10 text-accent-400"
          >
            Yararlı Bilgiler
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            Eğitmen Destek Kılavuzu
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="gold" size="lg" className="rounded-xl" asChild>
              <a href="#bolum-1">Kılavuza Başla</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-2 border-white/80 bg-transparent text-white hover:bg-white hover:text-primary-950"
              asChild
            >
              <Link href="/kurslar">Kursları İncele</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="border-b border-primary-100 bg-primary-50/60 py-6">
        <Container>
          <ol className="flex flex-wrap gap-3 md:gap-4">
            {instructorGuideToc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-2 text-sm font-medium text-primary-800 shadow-sm transition-colors hover:border-accent-500/40 hover:text-primary-900"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-900 text-xs font-bold text-accent-400">
                    {item.number}
                  </span>
                  <span className="hidden sm:inline">{item.title}</span>
                  <span className="sm:hidden">Bölüm {item.number}</span>
                </a>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          <aside
            className="mb-10 hidden lg:block"
            aria-label="İçindekiler"
          >
            <nav className="sticky top-24 rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
              <p className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary-600">
                <Users className="h-4 w-4 text-accent-600" aria-hidden="true" />
                İçindekiler
              </p>
              <ul className="space-y-1">
                {instructorGuideToc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-primary-700 transition-colors hover:bg-primary-50 hover:text-primary-900"
                    >
                      <span className="font-semibold text-accent-700">
                        {item.number}.
                      </span>{" "}
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="space-y-16">
            {instructorGuideChapters.map((chapter) => {
              const Icon = chapterIcons[chapter.number] ?? BookOpen;
              return (
                <article
                  key={chapter.id}
                  id={chapter.id}
                  className="scroll-mt-28"
                >
                  <header
                    id={`bolum-${chapter.number}`}
                    className="mb-8 flex scroll-mt-28 flex-col gap-4 border-b border-primary-100 pb-8 sm:flex-row sm:items-start sm:gap-6"
                  >
                    <div
                      className={cn(
                        "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                        "bg-gradient-to-br from-primary-900 to-primary-700 text-accent-400 shadow-lg"
                      )}
                    >
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-accent-600">
                        Bölüm {chapter.number}
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-primary-900 md:text-3xl">
                        {chapter.title}
                      </h2>
                    </div>
                  </header>

                  <div className="space-y-8">
                    {chapter.subsections.map((subsection) => (
                      <section
                        key={subsection.id}
                        id={subsection.id}
                        className="scroll-mt-28 rounded-2xl border border-primary-100 bg-white p-6 shadow-sm md:p-8"
                      >
                        <h3 className="mb-6 text-xl font-bold text-primary-900 md:text-2xl">
                          {subsection.title}
                        </h3>
                        <GuideBlocks blocks={subsection.blocks} />
                      </section>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </>
  );
}
