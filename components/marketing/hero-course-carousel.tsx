"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { categoryLabels, formatPrice } from "@/lib/data/courses";
import type { Course, CourseCategory } from "@/types/database";
import { cn } from "@/lib/utils";

const AUTO_PLAY_MS = 5000;

const categoryGradients: Record<CourseCategory, string> = {
  "planlama-otb": "from-primary-700 via-primary-800 to-primary-950",
  "ai-veri": "from-primary-600 via-primary-800 to-primary-950",
  liderlik: "from-primary-800 via-primary-900 to-primary-950",
  operasyon: "from-primary-700 via-primary-900 to-primary-950",
  pazarlama: "from-primary-600 via-primary-700 to-primary-900",
  "e-ticaret": "from-primary-800 via-primary-700 to-primary-950",
};

interface HeroCourseCarouselProps {
  courses: Course[];
}

function HeroCourseSlide({ course }: { course: Course }) {
  return (
    <Link
      href={`/kurslar?kurs=${course.slug}`}
      className="block h-full"
      tabIndex={-1}
    >
      <Card className="group h-full overflow-hidden border-primary-100/20 bg-white shadow-xl transition-shadow hover:shadow-2xl">
        <div
          className={cn(
            "relative flex aspect-[16/10] flex-col justify-end p-5 bg-gradient-to-br",
            categoryGradients[course.category]
          )}
        >
          <Badge className="mb-auto w-fit bg-accent-500/90 text-primary-950 hover:bg-accent-500">
            {categoryLabels[course.category]}
          </Badge>
          <p className="text-xs font-medium uppercase tracking-wider text-accent-400">
            Öne çıkan kurs
          </p>
          <h3 className="mt-1 line-clamp-2 text-lg font-bold text-white md:text-xl">
            {course.title}
          </h3>
        </div>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground">{course.instructor}</p>
          <div className="mt-2 flex items-center gap-1 text-sm text-primary-600">
            <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{course.duration}</span>
          </div>
        </CardContent>
        <CardFooter className="border-t border-primary-50 px-5 py-4">
          <span className="text-lg font-bold text-primary-900">
            {formatPrice(course.price)}
          </span>
          <span className="ml-auto text-sm font-medium text-accent-700 group-hover:underline">
            İncele →
          </span>
        </CardFooter>
      </Card>
    </Link>
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
      className="relative w-full max-w-xl lg:max-w-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Öne çıkan kurslar"
    >
      <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-accent-400 lg:text-left">
        Öne Çıkan Kurslar
      </p>

      <div className="relative rounded-2xl border border-accent-500/20 bg-primary-900/30 p-3 backdrop-blur-sm sm:p-4">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
            aria-live="polite"
          >
            {courses.map((course, slideIndex) => (
              <div
                key={course.id}
                className="w-full shrink-0 px-0.5"
                role="group"
                aria-roledescription="slide"
                aria-label={`${slideIndex + 1} / ${count}: ${course.title}`}
                aria-hidden={slideIndex !== index}
              >
                <HeroCourseSlide course={course} />
              </div>
            ))}
          </div>
        </div>

        {count > 1 && (
          <div className="mt-3 flex items-center justify-between gap-2">
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
