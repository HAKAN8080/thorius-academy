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
}: CourseCardV2Props) {
  const finalPrice = priceSale || priceNormal;
  const hasDiscount =
    priceSale != null &&
    priceNormal != null &&
    priceSale < priceNormal;
  const discountPercent = hasDiscount
    ? Math.round(((priceNormal! - priceSale!) / priceNormal!) * 100)
    : 0;

  const hasMetaRow = rating > 0 || lessonCount || duration;

  return (
    <Link
      href={`/kurslar/${slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-primary-100/50 bg-white",
        "shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-300 hover:shadow-xl",
        className,
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-primary-50">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={imageAlt || title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <span className="text-4xl font-bold text-primary-300">T</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {hasDiscount && (
            <Badge className="border-0 bg-gradient-to-br from-red-500 to-red-600 font-bold text-white shadow-md">
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
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-md transition-all hover:scale-110 hover:bg-accent-50"
          aria-label="Kursu kaydet"
        >
          <Bookmark className="h-4 w-4 text-primary-700" />
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        {(category || level) && (
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-600">
            {category && <span>{category}</span>}
            {category && level && (
              <span className="text-primary-300" aria-hidden="true">
                ·
              </span>
            )}
            {level && <span>{level}</span>}
          </div>
        )}

        <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-tight text-primary-950 transition-colors group-hover:text-accent-700">
          {title}
        </h3>

        {excerpt && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {excerpt}
          </p>
        )}

        {instructor && (
          <div className="mb-4 flex items-center gap-2">
            {instructor.avatar ? (
              <div className="relative h-7 w-7 overflow-hidden rounded-full border border-primary-100">
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
            <span className="text-sm font-medium text-primary-700">
              {instructor.name}
            </span>
          </div>
        )}

        {hasMetaRow && (
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-primary-600">
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

        <div className="flex items-end justify-between border-t border-primary-100 pt-4">
          <div className="flex flex-col gap-1">
            {hasDiscount && (
              <span className="text-sm text-primary-400 line-through">
                {priceNormal!.toLocaleString("tr-TR")}₺
              </span>
            )}
            {finalPrice ? (
              <span className="text-2xl font-bold text-primary-950">
                {finalPrice.toLocaleString("tr-TR")}₺
              </span>
            ) : (
              <span className="text-sm font-semibold text-emerald-600">
                Ücretsiz
              </span>
            )}
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-primary-950 transition-all group-hover:scale-110 group-hover:bg-accent-600 group-hover:shadow-lg">
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </div>
    </Link>
  );
}
