import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink, User } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAllCourses, fetchCourseBySlug } from "@/lib/wordpress/api";

interface CourseDetailPageProps {
  params: { slug: string };
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const courses = await fetchAllCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const course = await fetchCourseBySlug(params.slug);
  if (!course) return { title: "Kurs Bulunamadı" };

  return {
    title: course.title,
    description: course.excerpt.slice(0, 160),
    openGraph: {
      title: course.title,
      description: course.excerpt.slice(0, 160),
      images: course.featuredImage ? [course.featuredImage] : [],
      type: "article",
    },
  };
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const course = await fetchCourseBySlug(params.slug);
  if (!course) notFound();

  return (
    <article>
      <header className="bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-16 md:py-20">
        <Container>
          <Link
            href="/kurslar"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-100 hover:text-accent-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Tüm Kurslar
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

              <p className="text-base leading-relaxed text-primary-100 md:text-lg">
                {course.excerpt}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-primary-100">
                {course.instructor && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span>{course.instructor.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {new Date(course.publishedDate).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                  className="bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
                >
                  <a
                    href={course.wpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Kursa Katıl
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {course.featuredImage && (
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-accent-500/20 shadow-2xl lg:aspect-square">
                <Image
                  src={course.featuredImage}
                  alt={course.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </Container>
      </header>

      <section className="py-12 md:py-16">
        <Container size="narrow">
          <div
            className="course-content max-w-none text-primary-800 [&_a]:text-accent-600 [&_a]:underline [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-primary-950 [&_h3]:mb-3 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-primary-950 [&_li]:mb-2 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-primary-900 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: course.contentHtml }}
          />

          <div className="mt-12 rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 p-8 text-center">
            <h3 className="mb-3 text-xl font-bold text-primary-950 md:text-2xl">
              Bu kursla ilgileniyor musunuz?
            </h3>
            <p className="mb-6 text-muted-foreground">
              Kayıt olmak ve kursa başlamak için aşağıdaki butona tıklayın.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
            >
              <a
                href={course.wpLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Kursa Katıl
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </Container>
      </section>
    </article>
  );
}
