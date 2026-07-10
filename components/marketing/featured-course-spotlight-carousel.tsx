"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  BookOpen,
  Clock,
  FileSpreadsheet,
  FileText,
  Flame,
  GraduationCap,
  Paperclip,
  Sparkles,
  User,
} from "lucide-react";
import { CourseLanguageBadges } from "@/components/course/course-language-badges";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import type { FeaturedCourseSpotlight } from "@/types/featured-course-spotlight";

interface FeaturedCourseSpotlightCarouselProps {
  courses: FeaturedCourseSpotlight[];
  variant?: "hero" | "section";
}

function getHeroStackMinHeight(courseCount: number): number {
  if (courseCount <= 0) {
    return 0;
  }

  const cardHeightRem = 28;
  const center = (courseCount - 1) / 2;
  let maxTopRem = 0;

  for (let index = 0; index < courseCount; index += 1) {
    const offset = Math.abs(index - center);
    const topRem = 0.5 + offset * 2.25 + index * 0.65;
    maxTopRem = Math.max(maxTopRem, topRem);
  }

  return maxTopRem + cardHeightRem + 2;
}

function getStackPlacement(
  index: number,
  total: number,
  variant: "hero" | "section",
): {
  className: string;
  style: CSSProperties;
} {
  if (variant === "hero") {
    const center = (total - 1) / 2;
    const offset = index - center;
    const spreadRem = total <= 2 ? 4.75 : total === 3 ? 5.25 : 4.5;
    const rotateDeg = offset * 3.5;
    const topRem = 0.5 + Math.abs(offset) * 2.25 + index * 0.65;

    return {
      className:
        "absolute left-1/2 w-[min(78vw,11.75rem)] sm:w-[12.25rem] 2xl:w-[13rem]",
      style: {
        top: `${topRem}rem`,
        zIndex: 10 + index,
        transform: `translateX(calc(-50% + ${offset * spreadRem}rem)) rotate(${rotateDeg}deg)`,
      },
    };
  }

  const center = (total - 1) / 2;
  const offset = index - center;
  const spreadRem = total <= 3 ? 8.5 : total === 4 ? 7.2 : 6.4;
  const rotateDeg = offset * (total <= 3 ? 5 : 4);
  const topRem = 1.5 + Math.abs(offset) * 4.5 + index * 1.2;

  return {
    className:
      "absolute left-1/2 w-[min(86vw,16rem)] sm:w-[17rem] md:w-[16.5rem]",
    style: {
      top: `${topRem}rem`,
      zIndex: 10 + index,
      transform: `translateX(calc(-50% + ${offset * spreadRem}rem)) rotate(${rotateDeg}deg)`,
    },
  };
}

function formatPrice(value: number, locale: string): string {
  return `${value.toLocaleString(locale === "en" ? "en-US" : "tr-TR")}₺`;
}

function SpotlightCard({
  course,
  variant = "section",
}: {
  course: FeaturedCourseSpotlight;
  variant?: "hero" | "section";
}) {
  const t = useTranslations("home.spotlight");
  const locale = useLocale();
  const finalPrice = course.priceSale ?? course.priceNormal;
  const hasDiscount =
    course.priceSale != null &&
    course.priceNormal != null &&
    course.priceSale < course.priceNormal;
  const href = `/kurslar/${course.slug}` as const;

  return (
    <Link
      href={href}
      className="group/card block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
      aria-label={t("viewCourseAria", { title: course.title })}
    >
      <article
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-[0_22px_55px_-28px_rgba(15,23,42,0.45)] transition-transform duration-200 group-hover/card:-translate-y-1 group-hover/card:shadow-[0_28px_60px_-24px_rgba(15,23,42,0.5)]",
          variant === "hero" ? "min-h-[440px]" : "min-h-[520px]",
        )}
      >
        <div className="relative h-48 w-full shrink-0 overflow-hidden bg-primary-100 sm:h-52">
          {course.coverImageUrl ? (
            <Image
              src={course.coverImageUrl}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 92vw, 360px"
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
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
            {t("popular")}
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
                      alt=""
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
                {t("lessons", { count: course.lessonCount })}
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
                {t("whoFor")}
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
                {t("outcomes")}
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
                  {t("attachments", { count: course.attachmentCount })}
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
              <span className="text-xs text-primary-300">{t("noAttachments")}</span>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-primary-100 pt-3">
            <div className="min-h-[1.75rem]">
              {course.isFree ? (
                <p className="text-lg font-bold text-emerald-600">{t("free")}</p>
              ) : finalPrice ? (
                <div className="flex items-end gap-2">
                  {hasDiscount ? (
                    <span className="text-xs text-primary-400 line-through">
                      {formatPrice(course.priceNormal!, locale)}
                    </span>
                  ) : null}
                  <span className="text-lg font-bold text-primary-950">
                    {formatPrice(finalPrice, locale)}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-primary-500">{t("priceOnDetail")}</p>
              )}
            </div>

            <span className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-accent-500 px-3 text-sm font-semibold text-primary-950 transition-colors group-hover/card:bg-accent-400">
              {t("view")}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function FeaturedCourseSpotlightCarousel({
  courses,
  variant = "section",
}: FeaturedCourseSpotlightCarouselProps) {
  if (courses.length === 0) {
    return null;
  }

  const minHeightRem =
    variant === "hero"
      ? getHeroStackMinHeight(courses.length)
      : courses.length <= 3
        ? 42
        : courses.length === 4
          ? 46
          : 50;

  return (
    <div
      className={cn(
        "relative w-full",
        variant === "hero"
          ? "mx-auto max-w-[26rem] px-2 sm:max-w-[30rem] md:max-w-[34rem] lg:max-w-[40rem]"
          : "mx-auto max-w-6xl px-1 sm:px-2",
      )}
      style={{ minHeight: `${minHeightRem}rem` }}
    >
      {courses.map((course, index) => {
        const placement = getStackPlacement(index, courses.length, variant);

        return (
          <div
            key={course.id}
            className={cn(
              placement.className,
              "transition-[z-index] duration-150",
              "hover:z-50 focus-within:z-50",
            )}
            style={placement.style}
          >
            <SpotlightCard course={course} variant={variant} />
          </div>
        );
      })}
    </div>
  );
}
