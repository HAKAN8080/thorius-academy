"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroCourseSlide } from "@/components/marketing/hero-course-slide";
import {
  HeroCarouselHeading,
  HeroCarouselShell,
} from "@/components/marketing/hero-carousel-shell";
import { ScreenFlicker } from "@/components/marketing/screen-flicker";
import { Button } from "@/components/ui/button";
import type { Course } from "@/types/wordpress";
import { cn } from "@/lib/utils";

const AUTO_PLAY_MS = 4500;

interface HeroCourseCarouselClientProps {
  courses: Course[];
}

function scheduleIdleWork(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 2500 });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(callback, 300);
  return () => window.clearTimeout(id);
}

export function HeroCourseCarouselClient({ courses }: HeroCourseCarouselClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [extraSlidesReady, setExtraSlidesReady] = useState(false);

  const count = courses.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) {
        return;
      }
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (count <= 1) {
      setExtraSlidesReady(true);
      return;
    }

    return scheduleIdleWork(() => setExtraSlidesReady(true));
  }, [count]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const host = rootRef.current?.closest("[data-hero-carousel]");
    const staticPreview = host?.querySelector<HTMLElement>(
      "[data-hero-carousel-static]",
    );
    const clientLayer = rootRef.current?.parentElement;

    if (staticPreview) {
      staticPreview.hidden = true;
    }
    if (clientLayer) {
      clientLayer.dataset.ready = "true";
    }
  }, [hydrated]);

  useEffect(() => {
    if (count <= 1 || paused || !extraSlidesReady) {
      return;
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      return;
    }

    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(id);
  }, [count, paused, extraSlidesReady]);

  if (count === 0) {
    return null;
  }

  if (!hydrated) {
    return null;
  }

  const shouldRenderSlide = (slideIndex: number) =>
    slideIndex === 0 || extraSlidesReady || slideIndex === index;

  return (
    <div
      ref={rootRef}
      className="w-full"
      aria-roledescription="carousel"
      aria-label="Öne çıkan kurslar"
    >
      <HeroCarouselHeading />
      <HeroCarouselShell>
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
                  {shouldRenderSlide(slideIndex) ? (
                    <HeroCourseSlide
                      course={course}
                      priority={slideIndex === 0}
                    />
                  ) : (
                    <div
                      className="aspect-[16/10] w-full bg-primary-950"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScreenFlicker>
      </HeroCarouselShell>

      {count > 1 && extraSlidesReady ? (
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
                    : "w-2 bg-primary-100/40 hover:bg-accent-500/60",
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
      ) : count > 1 ? (
        <div className="mt-4 h-9" aria-hidden="true" />
      ) : null}
    </div>
  );
}
