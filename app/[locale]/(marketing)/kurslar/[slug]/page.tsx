import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { CourseDetailPurchaseSection } from "@/components/course/course-detail-purchase-panel";
import { CourseCurriculumPreview } from "@/components/course/course-curriculum-preview";
import { getCourseCurriculumPreview } from "@/lib/lessons/curriculum-preview";
import { getCourseLanguageMetaBySlug } from "@/lib/course/course-language";
import { CourseLanguageBadges } from "@/components/course/course-language-badges";
import { CourseContentLanguageNotice } from "@/components/course/course-content-language-notice";
import { fetchLocalizedCourseBySlug } from "@/lib/course/fetch-localized-course-by-slug";
import { resolveCourseCoverImageUrl } from "@/lib/course/resolve-course-cover-image";
import { getCourseProduct } from "@/lib/actions/course-products";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildCourseJsonLd } from "@/lib/seo/course-schema";

interface CourseDetailPageProps {
  params: { slug: string };
}

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("courses.detail");
  const course = await fetchLocalizedCourseBySlug(params.slug, locale);
  if (!course) return { title: t("notFound") };

  const description = course.excerpt.slice(0, 160);

  return {
    title: course.title,
    description,
    openGraph: {
      title: course.title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const t = await getTranslations("courses.detail");
  const locale = await getLocale();
  const dateLocale = locale === "en" ? "en-US" : "tr-TR";

  const course = await fetchLocalizedCourseBySlug(params.slug, locale);
  if (!course) notFound();

  const coverImageUrl = await resolveCourseCoverImageUrl({
    slug: course.slug,
    coverImageUrl: course.featuredImage,
  });
  const courseWithCover = coverImageUrl
    ? { ...course, featuredImage: coverImageUrl }
    : course;

  const curriculum = await getCourseCurriculumPreview(
    courseWithCover.id,
    params.slug,
    locale === "en" ? "en" : "tr",
  );
  const [product, languageMeta] = await Promise.all([
    getCourseProduct(params.slug),
    getCourseLanguageMetaBySlug(params.slug),
  ]);
  const courseJsonLd = buildCourseJsonLd(
    courseWithCover,
    product,
    coverImageUrl,
  );

  return (
    <article>
      <JsonLd data={courseJsonLd} />
      <header className="bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-16 md:py-20">
        <Container>
          <Link
            href="/kurslar"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-100 hover:text-accent-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("backToCatalog")}
          </Link>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
            <div className="flex flex-col gap-4">
              {course.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.categories.map((cat) => (
                    <Badge
                      key={cat.id}
                      className="border border-accent-500/30 bg-accent-500/10 text-accent-400"
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              )}

              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
                {course.title}
              </h1>

              <CourseContentLanguageNotice
                pageLocale={locale}
                courseLanguage={languageMeta.language}
                hasLocaleContent={course.hasLocaleContent}
                variant="dark"
              />

              <p className="text-base leading-relaxed text-primary-100 md:text-lg">
                {course.excerpt}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-primary-100">
                <CourseLanguageBadges
                  language={languageMeta.language}
                  subtitleLanguage={languageMeta.subtitleLanguage}
                  overlay
                />
                {course.instructor && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span>{course.instructor.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {new Date(course.publishedDate).toLocaleDateString(
                      dateLocale,
                      {
                        year: "numeric",
                        month: "long",
                      },
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <CourseDetailPurchaseSection course={courseWithCover} theme="dark" />
              </div>
            </div>

            {courseWithCover.featuredImage && (
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-accent-500/20 bg-primary-900/50 shadow-2xl">
                <Image
                  src={courseWithCover.featuredImage}
                  alt={courseWithCover.imageAlt || courseWithCover.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute bottom-3 left-3 z-10">
                  <CourseLanguageBadges
                    language={languageMeta.language}
                    subtitleLanguage={languageMeta.subtitleLanguage}
                    overlay
                  />
                </div>
              </div>
            )}
          </div>
        </Container>
      </header>

      {curriculum && curriculum.totalLessons > 0 ? (
        <section className="border-b border-primary-100 py-10 md:py-12">
          <Container size="narrow">
            <CourseCurriculumPreview
              courseSlug={params.slug}
              curriculum={curriculum}
            />
          </Container>
        </section>
      ) : null}

      <section className="py-12 md:py-16">
        <Container size="narrow">
          <div
            className="prose prose-lg max-w-none prose-headings:text-primary-950 prose-a:text-accent-600"
            dangerouslySetInnerHTML={{ __html: course.content }}
          />

          <div className="mt-12 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 p-8 text-center">
            <h3 className="mb-3 text-xl font-bold text-primary-950 md:text-2xl">
              {t("interestTitle")}
            </h3>
            <p className="mb-6 text-muted-foreground">{t("interestBody")}</p>
            <CourseDetailPurchaseSection course={courseWithCover} />
          </div>
        </Container>
      </section>
    </article>
  );
}
