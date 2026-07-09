"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Paperclip,
  Sparkles,
  User,
} from "lucide-react";
import { CourseLanguageBadges } from "@/components/course/course-language-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FeaturedCourseSpotlight } from "@/types/featured-course-spotlight";

interface FeaturedCourseSpotlightCarouselProps {
  courses: FeaturedCourseSpotlight[];
}

function formatPrice(value: number): string {
  return `${value.toLocaleString("tr-TR")}₺`;
}

function SpotlightCard({ course }: { course: FeaturedCourseSpotlight }) {
  const finalPrice = course.priceSale ?? course.priceNormal;
  const hasDiscount =
    course.priceSale != null &&
    course.priceNormal != null &&
    course.priceSale < course.priceNormal;

  return (
    <article className="flex h-full min-h-[560px] w-full flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm">
      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-primary-100 sm:h-52">
        {course.coverImageUrl ? (
          <Image
            src={course.coverImageUrl}
            alt={course.title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-300" />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-transparent to-transparent"
          aria-hidden="true"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {course.category ? (
            <Badge className="border-0 bg-accent-500/95 text-[11px] text-primary-950">
              {course.category}
            </Badge>
          ) : null}
          <Badge className="border border-white/20 bg-primary-950/70 text-[11px] text-white backdrop-blur-sm">
            {course.level}
          </Badge>
        </div>

        <div className="absolute bottom-3 left-3">
          <CourseLanguageBadges
            language={course.language}
            subtitleLanguage={course.subtitleLanguage}
            overlay
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Yeni eğitim
        </p>

        <h3 className="line-clamp-2 min-h-[2.75rem] text-lg font-bold leading-snug text-primary-950">
          {course.title}
        </h3>

        <p className="mt-1 line-clamp-1 min-h-[1.25rem] text-sm font-medium text-primary-600">
          {course.subtitle || "\u00A0"}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-primary-100 pb-3 text-xs text-primary-700">
          {course.instructorName ? (
            <div className="flex min-w-0 items-center gap-2">
              {course.instructorAvatar ? (
                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-primary-100">
                  <Image
                    src={course.instructorAvatar}
                    alt={course.instructorName}
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                </div>
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50">
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              )}
              <span className="truncate font-medium">{course.instructorName}</span>
            </div>
          ) : null}

          {course.lessonCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-accent-600" aria-hidden="true" />
              {course.lessonCount} ders
            </span>
          ) : null}

          {course.durationLabel ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-accent-600" aria-hidden="true" />
              {course.durationLabel}
            </span>
          ) : null}
        </div>

        <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground">
          {course.summary || "\u00A0"}
        </p>

        <div className="mt-3 grid min-h-[4.5rem] flex-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-primary-50/80 p-2.5">
            <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-primary-900">
              <GraduationCap className="h-3.5 w-3.5 text-accent-600" aria-hidden="true" />
              Kimler için?
            </p>
            {course.targetAudience.length > 0 ? (
              <ul className="space-y-1 text-xs text-primary-700">
                {course.targetAudience.slice(0, 2).map((item) => (
                  <li key={item} className="line-clamp-1">
                    • {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-primary-400">—</p>
            )}
          </div>

          <div className="rounded-lg bg-primary-50/80 p-2.5">
            <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-primary-900">
              <Sparkles className="h-3.5 w-3.5 text-accent-600" aria-hidden="true" />
              Kazanımlar
            </p>
            {course.learningOutcomes.length > 0 ? (
              <ul className="space-y-1 text-xs text-primary-700">
                {course.learningOutcomes.slice(0, 2).map((item) => (
                  <li key={item} className="line-clamp-1">
                    • {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-primary-400">—</p>
            )}
          </div>
        </div>

        <div className="mt-3 min-h-[1.75rem]">
          {course.attachmentCount > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary-500">
                <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                {course.attachmentCount} ek
              </span>
              {course.attachments.slice(0, 2).map((attachment) => {
                const Icon =
                  attachment.type === "excel" ? FileSpreadsheet : FileText;
                return (
                  <span
                    key={`${attachment.type}-${attachment.name}`}
                    className="inline-flex max-w-[8rem] items-center gap-1 truncate rounded-full border border-primary-100 px-2 py-0.5 text-[10px] text-primary-700"
                    title={attachment.name}
                  >
                    <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="truncate">{attachment.name}</span>
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-primary-300">Ek materyal yok</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-primary-100 pt-3">
          <div className="min-h-[1.75rem]">
            {course.isFree ? (
              <p className="text-lg font-bold text-emerald-600">Ücretsiz</p>
            ) : finalPrice ? (
              <div className="flex items-end gap-2">
                {hasDiscount ? (
                  <span className="text-xs text-primary-400 line-through">
                    {formatPrice(course.priceNormal!)}
                  </span>
                ) : null}
                <span className="text-lg font-bold text-primary-950">
                  {formatPrice(finalPrice)}
                </span>
              </div>
            ) : (
              <p className="text-xs text-primary-500">Detayda fiyat</p>
            )}
          </div>

          <Button variant="gold" size="sm" asChild className="shrink-0 rounded-lg">
            <Link href={`/kurslar/${course.slug}`}>
              İncele
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function FeaturedCourseSpotlightCarousel({
  courses,
}: FeaturedCourseSpotlightCarouselProps) {
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    function updateVisibleCount() {
      if (window.matchMedia("(min-width: 1280px)").matches) {
        setVisibleCount(Math.min(3, courses.length));
        return;
      }
      if (window.matchMedia("(min-width: 768px)").matches) {
        setVisibleCount(Math.min(2, courses.length));
        return;
      }
      setVisibleCount(1);
    }

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [courses.length]);

  useEffect(() => {
    setIndex((current) =>
      Math.min(current, Math.max(0, courses.length - visibleCount)),
    );
  }, [visibleCount, courses.length]);

  useEffect(() => {
    if (courses.length <= visibleCount) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => {
        const maxIndex = courses.length - visibleCount;
        return current >= maxIndex ? 0 : current + 1;
      });
    }, 9000);

    return () => window.clearInterval(timer);
  }, [courses.length, visibleCount]);

  if (courses.length === 0) {
    return null;
  }

  const maxIndex = Math.max(0, courses.length - visibleCount);
  const slideWidthPercent = 100 / visibleCount;

  function goPrev() {
    setIndex((current) => (current <= 0 ? maxIndex : current - 1));
  }

  function goNext() {
    setIndex((current) => (current >= maxIndex ? 0 : current + 1));
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/95 p-4 shadow-2xl backdrop-blur-sm sm:p-5">
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${index * slideWidthPercent}%)`,
          }}
        >
          {courses.map((course) => (
            <div
              key={course.id}
              className="shrink-0 px-2"
              style={{ width: `${slideWidthPercent}%` }}
            >
              <SpotlightCard course={course} />
            </div>
          ))}
        </div>
      </div>

      {courses.length > visibleCount ? (
        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                onClick={() => setIndex(dotIndex)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  dotIndex === index
                    ? "w-8 bg-accent-500"
                    : "w-2.5 bg-primary-200 hover:bg-primary-300",
                )}
                aria-label={`${dotIndex + 1}. slayt`}
                aria-current={dotIndex === index ? "true" : undefined}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-800 transition hover:border-accent-400 hover:text-accent-700"
              aria-label="Önceki eğitimler"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 bg-white text-primary-800 transition hover:border-accent-400 hover:text-accent-700"
              aria-label="Sonraki eğitimler"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
