"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScreenFlicker } from "@/components/marketing/screen-flicker";
import type { Course } from "@/types/wordpress";
import { cn } from "@/lib/utils";

const AUTO_PLAY_MS = 4500;

const slideGradients = [
  "from-primary-700 via-primary-800 to-primary-950",
  "from-primary-600 via-primary-800 to-primary-950",
  "from-primary-800 via-primary-900 to-primary-950",
  "from-primary-700 via-primary-900 to-primary-950",
  "from-primary-600 via-primary-700 to-primary-900",
  "from-primary-800 via-primary-700 to-primary-950",
];

interface HeroCourseCarouselProps {
  courses: Course[];
}

function HeroCourseSlide({
  course,
  gradient,
}: {
  course: Course;
  gradient: string;
}) {
  return (
    <Link
      href={`/kurslar/${course.slug}`}
      className="block h-full"
      tabIndex={-1}
    >
      <Card className="group h-full overflow-hidden rounded-none border-0 bg-white shadow-none transition-shadow hover:shadow-none">
        <div
          className={cn(
            "relative flex aspect-[16/10] flex-col justify-end overflow-hidden bg-gradient-to-br p-5",
            gradient
          )}
        >
          {course.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.featuredImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-30"
            />
          )}
          {course.categories.length > 0 && (
            <Badge className="relative z-10 mb-auto w-fit bg-accent-500/90 text-primary-950 hover:bg-accent-500">
              {course.categories[0].name}
            </Badge>
          )}
          <p className="relative z-10 text-xs font-medium uppercase tracking-wider text-accent-400">
            Öne çıkan kurs
          </p>
          <h3 className="relative z-10 mt-1 line-clamp-2 text-lg font-bold text-white md:text-xl">
            {course.title}
          </h3>
        </div>
        <CardContent className="p-5">
          {course.instructor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{course.instructor.name}</span>
            </div>
          )}
          <p className="mt-2 line-clamp-2 text-sm text-primary-600">
            {course.excerpt}
          </p>
        </CardContent>
        <CardFooter className="border-t border-primary-50 px-5 py-4">
          <span className="text-sm font-medium text-accent-700 group-hover:underline">
            İncele →
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

function MacScreenMockup({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full">
      {/* MacBook gövde — space gray alüminyum */}
      <div className="rounded-[1.35rem] border border-white/[0.12] bg-gradient-to-b from-[#3d3d40] via-[#2e2e31] to-[#252528] p-2 shadow-[0_28px_70px_-12px_rgba(0,0,0,0.65)] sm:rounded-[1.5rem] sm:p-2.5">
        {/* macOS pencere başlığı + traffic lights */}
        <div className="flex items-center gap-3 rounded-t-[0.85rem] border-b border-white/[0.06] bg-[#1a1a1c]/95 px-3 py-2 sm:px-3.5 sm:py-2.5">
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)] sm:h-3 sm:w-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] sm:h-3 sm:w-3" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)] sm:h-3 sm:w-3" />
          </div>
          <p className="flex-1 truncate text-center text-[10px] font-medium tracking-wide text-white/35 sm:text-[11px]">
            Thorius Academy — academy.thorius.com.tr
          </p>
          <div className="hidden w-[52px] shrink-0 sm:block" aria-hidden="true" />
        </div>

        {/* Ekran — flicker yalnızca burada */}
        <div className="overflow-hidden rounded-b-[0.85rem] bg-[#0a0a0b] ring-1 ring-inset ring-black/40">
          {children}
        </div>
      </div>

      {/* MacBook alt menteşe / chin */}
      <div
        className="mx-auto -mt-px h-[7px] w-[18%] rounded-b-md bg-gradient-to-b from-[#4a4a4d] to-[#353538] sm:h-2"
        aria-hidden="true"
      />
      <div
        className="mx-auto mt-1 h-[3px] w-[62%] rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

export function HeroCourseCarousel({ courses }: HeroCourseCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = courses.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (count <= 1 || paused) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(id);
  }, [count, paused]);

  if (count === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full"
      aria-roledescription="carousel"
      aria-label="Öne çıkan kurslar"
    >
      <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-accent-400 lg:text-left">
        Öne Çıkan Kurslar
      </p>

      <div className="w-full">
        <MacScreenMockup>
          <ScreenFlicker trigger={index}>
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(-${index * 100}%)` }}
                aria-live="polite"
              >
                {courses.map((course, slideIndex) => (
                  <div
                    key={course.id}
                    className="w-full shrink-0"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${slideIndex + 1} / ${count}: ${course.title}`}
                    aria-hidden={slideIndex !== index}
                  >
                    <HeroCourseSlide
                      course={course}
                      gradient={
                        slideGradients[slideIndex % slideGradients.length] ??
                        slideGradients[0]
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScreenFlicker>
        </MacScreenMockup>

        {count > 1 && (
          <div
            className="mt-4 flex items-center justify-between gap-2 px-1"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full border-accent-500/40 bg-primary-950/90 text-white hover:bg-primary-900 hover:text-accent-400"
              onClick={() => goTo(index - 1)}
              aria-label="Önceki kurs"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div
              className="flex flex-1 justify-center gap-2"
              role="tablist"
              aria-label="Kurs slaytları"
            >
              {courses.map((course, dotIndex) => (
                <button
                  key={course.id}
                  type="button"
                  role="tab"
                  aria-selected={dotIndex === index}
                  aria-label={`${course.title} slaydına git`}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    dotIndex === index
                      ? "w-8 bg-accent-500"
                      : "w-2 bg-primary-100/40 hover:bg-accent-500/60"
                  )}
                  onClick={() => goTo(dotIndex)}
                />
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full border-accent-500/40 bg-primary-950/90 text-white hover:bg-primary-900 hover:text-accent-400"
              onClick={() => goTo(index + 1)}
              aria-label="Sonraki kurs"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
