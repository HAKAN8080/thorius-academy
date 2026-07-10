import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Container } from "@/components/layout/container";
import { getHomepageFreeHubColumns } from "@/lib/course/homepage-free-hub";
import { cn } from "@/lib/utils";

export async function FreeCoursesHubSection() {
  const t = await getTranslations("home.freeHub");
  const columns = await getHomepageFreeHubColumns();
  const hasCourses = columns.some((column) => column.courses.length > 0);

  if (!hasCourses) {
    return null;
  }

  return (
    <section
      id="ucretsiz-kurslar"
      className="border-b border-primary-100 bg-white py-12 md:py-16"
      aria-labelledby="free-courses-hub-heading"
    >
      <Container size="wide">
        <h2
          id="free-courses-hub-heading"
          className="mb-8 text-3xl font-bold tracking-tight text-primary-950 md:text-4xl"
        >
          {t("title")}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {columns.map((column) => (
            <div
              key={column.id}
              className={cn(
                "rounded-2xl border bg-gradient-to-br p-4 shadow-sm sm:p-5",
                column.accentClass,
              )}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-primary-950">
                  {t(`columns.${column.id}`)}
                </h3>
                <Link
                  href={column.viewAllHref}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary-800 transition-colors hover:text-accent-700"
                >
                  {t("viewAll")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {column.courses.length > 0 ? (
                <ul className="space-y-3">
                  {column.courses.map((course) => (
                    <li key={course.slug}>
                      <Link
                        href={course.href}
                        className="group flex gap-3 rounded-xl border border-white/70 bg-white/90 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-400/40 hover:shadow-md"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-primary-100">
                          {course.coverImageUrl ? (
                            <Image
                              src={course.coverImageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-200 to-primary-300">
                              <GraduationCap
                                className="h-6 w-6 text-primary-600"
                                aria-hidden="true"
                              />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold leading-snug text-primary-950 group-hover:text-primary-900">
                            {course.title}
                          </p>
                          <p className="mt-1 text-xs text-primary-600">
                            {course.instructorName
                              ? `${course.instructorName} · `
                              : ""}
                            {t("freeLabel")}
                          </p>
                          <p className="mt-0.5 text-[11px] text-primary-500">
                            {course.level}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-primary-200 bg-white/70 px-4 py-6 text-center text-sm text-primary-600">
                  {t("empty")}
                </p>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
