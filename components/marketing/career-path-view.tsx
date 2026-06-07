import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, Award, Briefcase, Users } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/marketing/course-card";
import type { CareerPathDefinition } from "@/lib/content/career-path-types";
import type { ResolvedCareerPathStep } from "@/lib/course/resolve-career-path-courses";
import type { CourseProduct } from "@/types/course-product";

const milestoneIcons = [Award, Users, Briefcase] as const;

interface CareerPathViewProps {
  path: CareerPathDefinition;
  steps: ResolvedCareerPathStep[];
  productBySlug: Map<string, CourseProduct>;
}

export function CareerPathView({ path, steps, productBySlug }: CareerPathViewProps) {
  const firstStepWithCourse = steps.find((step) => step.course);

  return (
    <>
      <section className="bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-16 text-white md:py-20">
        <Container size="narrow" className="text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
            {path.heroEyebrow}
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">{path.title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary-100">
            {path.subtitle}
          </p>
          {firstStepWithCourse?.course && (
            <Button
              asChild
              size="lg"
              className="mt-8 rounded-xl bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
            >
              <Link href={`/kurslar/${firstStepWithCourse.course.slug}`}>
                Yola başla
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </Container>
      </section>

      <section className="py-14 md:py-20" aria-labelledby="path-outcomes-heading">
        <Container size="wide">
          <h2
            id="path-outcomes-heading"
            className="mb-8 text-center text-3xl font-bold text-primary-950"
          >
            Bu yolu tamamlayanlar ne yapabilir?
          </h2>
          <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2">
            {path.outcomes.map((outcome) => (
              <li
                key={outcome}
                className="rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3 text-sm font-medium text-primary-900"
              >
                ✓ {outcome}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-white py-14 md:py-20" aria-labelledby="path-steps-heading">
        <Container size="narrow">
          <h2
            id="path-steps-heading"
            className="mb-4 text-center text-3xl font-bold text-primary-950"
          >
            Adım adım öğrenme yolu
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
            Her basamak gerçek bir Thorius kursuna bağlıdır. İstediğiniz
            adımdan başlayabilir, eksiklerinizi tamamlayarak ilerleyebilirsiniz.
          </p>

          <div className="flex flex-col items-center gap-6">
            {steps.map((step, index) => (
              <div key={step.slug} className="flex w-full flex-col items-center">
                <article className="w-full overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-md">
                  <div className="flex flex-col gap-4 border-b border-primary-50 bg-primary-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-accent-700">
                        {step.level}
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-primary-950">
                        {step.label}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    <Button asChild variant="outline" className="shrink-0 rounded-xl">
                      <Link href={`/kurslar/${step.slug}`}>Kursa git</Link>
                    </Button>
                  </div>

                  {step.course ? (
                    <div className="p-5">
                      <CourseCard
                        course={step.course}
                        product={productBySlug.get(step.course.slug) ?? null}
                        size="compact"
                      />
                    </div>
                  ) : (
                    <div className="p-5 text-sm text-muted-foreground">
                      {step.fallbackTitle} — kurs detayı yüklenemedi, bağlantı
                      aktif.
                    </div>
                  )}
                </article>

                {index < steps.length - 1 && (
                  <ArrowDown
                    className="my-1 h-6 w-6 text-accent-600"
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section
        className="border-y border-primary-100 bg-primary-50/40 py-14 md:py-20"
        aria-labelledby="path-milestones-heading"
      >
        <Container size="wide">
          <h2
            id="path-milestones-heading"
            className="mb-10 text-center text-3xl font-bold text-primary-950"
          >
            Yolun sonunda
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {path.milestones.map((milestone, index) => {
              const Icon = milestoneIcons[index] ?? Award;
              const content = (
                <div className="flex h-full flex-col rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 inline-flex w-fit rounded-xl bg-accent-500/10 p-3">
                    <Icon className="h-6 w-6 text-accent-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-primary-950">
                    {milestone.label}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {milestone.description}
                  </p>
                  {milestone.href && (
                    <span className="mt-4 text-sm font-semibold text-primary-700">
                      Detaylar →
                    </span>
                  )}
                </div>
              );

              if (milestone.href) {
                return (
                  <Link key={milestone.label} href={milestone.href} className="group">
                    {content}
                  </Link>
                );
              }

              return <div key={milestone.label}>{content}</div>;
            })}
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container size="narrow" className="text-center">
          <div className="relative mx-auto mb-8 max-w-md overflow-hidden rounded-2xl">
            <Image
              src="/images/hero-visual.jpg"
              alt=""
              width={800}
              height={450}
              className="h-auto w-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-primary-950 md:text-3xl">
            {path.closingTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {path.closingDescription}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gold" className="rounded-xl">
              <Link href={path.catalogHref}>{path.catalogLabel}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link href="/kurumsal">Kurumsal teklif</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-xl">
              <Link href="/kariyer-yolu">Tüm kariyer yolları</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
