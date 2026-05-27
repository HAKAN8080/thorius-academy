"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, BookOpen, Clock, Bookmark, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import type { CourseCardV2Props } from "@/types/course-card";

export type { CourseCardV2Props };

export function CourseCardV2({
  slug,
  title,
  excerpt,
  thumbnail,
  imageAlt,
  category,
  level,
  instructor,
  rating = 0,
  ratingCount = 0,
  lessonCount,
  duration,
  priceNormal,
  priceSale,
  isEnrolled,
  className,
  size = "default",
}: CourseCardV2Props) {
  const finalPrice = priceSale || priceNormal;
  const hasDiscount =
    priceSale != null &&
    priceNormal != null &&
    priceSale < priceNormal;
  const discountPercent = hasDiscount
    ? Math.round(((priceNormal! - priceSale!) / priceNormal!) * 100)
    : 0;

  const hasMetaRow =
    rating > 0 || (lessonCount !== undefined && lessonCount > 0) || !!duration;
  const isCompact = size === "compact";

  return (
    <Link
      href={`/kurslar/${slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-primary-100/50 bg-white",
        "shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-300 hover:shadow-xl",
        isCompact && "rounded-xl",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-primary-100",
          "aspect-video",
        )}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={imageAlt || title}
            fill
            className={cn(
              "transition-transform duration-500 group-hover:scale-[1.02]",
              isCompact
                ? "object-contain object-center p-1.5"
                : "object-cover group-hover:scale-105",
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <span className="text-4xl font-bold text-primary-300">T</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {hasDiscount && (
            <Badge
              className={cn(
                "border-0 bg-gradient-to-br from-red-500 to-red-600 font-bold text-white shadow-md",
                isCompact && "px-1.5 py-0 text-[10px]",
              )}
            >
              %{discountPercent} İndirim
            </Badge>
          )}
          {isEnrolled && (
            <Badge className="border-0 bg-emerald-500 text-white shadow-md">
              ✓ Kayıtlı
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={cn(
            "absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-md transition-all hover:scale-110 hover:bg-accent-50",
            isCompact && "hidden sm:flex",
          )}
          aria-label="Kursu kaydet"
        >
          <Bookmark className="h-4 w-4 text-primary-700" />
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className={cn("flex flex-1 flex-col", isCompact ? "p-3" : "p-5")}>
        {(category || level) && (
          <div
            className={cn(
              "mb-2 flex items-center gap-2 font-semibold uppercase tracking-wider text-primary-600",
              isCompact ? "text-[10px]" : "mb-3 text-xs",
            )}
          >
            {category && <span>{category}</span>}
            {category && level && (
              <span className="text-primary-300" aria-hidden="true">
                ·
              </span>
            )}
            {level && <span>{level}</span>}
          </div>
        )}

        <h3
          className={cn(
            "mb-2 line-clamp-2 font-bold leading-tight text-primary-950 transition-colors group-hover:text-accent-700",
            isCompact ? "text-sm" : "text-lg",
          )}
        >
          {title}
        </h3>

        {excerpt && !isCompact && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {excerpt}
          </p>
        )}

        {instructor && (
          <div className={cn("mb-3 flex items-center gap-2", isCompact && "mb-2")}>
            {instructor.avatar ? (
              <div
                className={cn(
                  "relative overflow-hidden rounded-full border border-primary-100",
                  isCompact ? "h-5 w-5" : "h-7 w-7",
                )}
              >
                <Image
                  src={instructor.avatar}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="28px"
                />
              </div>
            ) : (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full border border-primary-100 bg-primary-50 text-xs font-semibold text-primary-600"
                aria-hidden="true"
              >
                {instructor.name.charAt(0)}
              </div>
            )}
            <span
              className={cn(
                "font-medium text-primary-700",
                isCompact ? "truncate text-xs" : "text-sm",
              )}
            >
              {instructor.name}
            </span>
          </div>
        )}

        {hasMetaRow && (
          <div
            className={cn(
              "mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-primary-600",
              isCompact ? "text-[11px]" : "mb-4 text-sm",
            )}
          >
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent-500 text-accent-500" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
                {ratingCount > 0 && (
                  <span className="text-primary-400">({ratingCount})</span>
                )}
              </div>
            )}
            {lessonCount !== undefined && lessonCount > 0 && (
              <>
                {rating > 0 && (
                  <span className="text-primary-300" aria-hidden="true">
                    ·
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>{lessonCount} ders</span>
                </div>
              </>
            )}
            {duration && (
              <>
                {(rating > 0 || (lessonCount !== undefined && lessonCount > 0)) && (
                  <span className="text-primary-300" aria-hidden="true">
                    ·
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>{duration}</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex-1" />

        <div
          className={cn(
            "flex items-end justify-between border-t border-primary-100 pt-3",
            !isCompact && "pt-4",
          )}
        >
          <div className="flex flex-col gap-0.5">
            {hasDiscount && (
              <span
                className={cn(
                  "text-primary-400 line-through",
                  isCompact ? "text-[10px]" : "text-sm",
                )}
              >
                {priceNormal!.toLocaleString("tr-TR")}₺
              </span>
            )}
            {finalPrice ? (
              <span
                className={cn(
                  "font-bold text-primary-950",
                  isCompact ? "text-base" : "text-2xl",
                )}
              >
                {finalPrice.toLocaleString("tr-TR")}₺
              </span>
            ) : (
              <span
                className={cn(
                  "font-semibold text-emerald-600",
                  isCompact ? "text-xs" : "text-sm",
                )}
              >
                Ücretsiz
              </span>
            )}
          </div>

          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-accent-500 text-primary-950 transition-all group-hover:scale-110 group-hover:bg-accent-600 group-hover:shadow-lg",
              isCompact ? "h-8 w-8" : "h-10 w-10",
            )}
          >
            <ArrowRight
              className={cn(isCompact ? "h-4 w-4" : "h-5 w-5")}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
