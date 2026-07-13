"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Clock, Earth, Globe2, Layers, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  countries: Globe2,
  continents: Earth,
  students: Users,
  hours: Clock,
  courses: BookOpen,
  lessons: Layers,
};

const STATS = [
  {
    key: "countries",
    value: "30+",
    numericTarget: 30,
    suffix: "+",
    image: "/images/stats/world-map.jpg",
    imagePosition: "object-center",
    imageTone: "map" as const,
  },
  {
    key: "continents",
    value: "7",
    numericTarget: 7,
    suffix: "",
    image: "/images/stats/world-map.jpg",
    imagePosition: "object-[center_40%]",
    imageTone: "map" as const,
  },
  {
    key: "students",
    value: "500+",
    numericTarget: 500,
    suffix: "+",
    image: "/images/stats/students.jpg",
    imagePosition: "object-[center_30%]",
    imageTone: "photo" as const,
  },
  {
    key: "hours",
    value: "170+",
    numericTarget: 170,
    suffix: "+",
    image: "/images/stats/hours.jpg",
    imagePosition: "object-center",
    imageTone: "photo" as const,
  },
  {
    key: "courses",
    value: "250+",
    numericTarget: 250,
    suffix: "+",
    image: "/images/stats/courses.jpg",
    imagePosition: "object-center",
    imageTone: "photo" as const,
  },
  {
    key: "lessons",
    value: "1500+",
    numericTarget: 1500,
    suffix: "+",
    image: "/images/stats/lessons.jpg",
    imagePosition: "object-center",
    imageTone: "photo" as const,
  },
] as const;

const DURATION_MS = 2200;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

interface AcademyStatsCounterProps {
  labels: Record<(typeof STATS)[number]["key"], string>;
  ariaLabel: string;
}

export function AcademyStatsCounter({
  labels,
  ariaLabel,
}: AcademyStatsCounterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [displayValues, setDisplayValues] = useState(
    () => new Map(STATS.map((stat) => [stat.key, 0])),
  );

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) {
      return;
    }

    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION_MS);
      const eased = easeOutCubic(progress);

      setDisplayValues(
        new Map(
          STATS.map((stat) => [
            stat.key,
            Math.round(stat.numericTarget * eased),
          ]),
        ),
      );

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [started]);

  return (
    <section
      ref={sectionRef}
      aria-label={ariaLabel}
      className="relative overflow-hidden border-b border-accent-500/25 bg-[#0B1E3F]"
    >
      {/* Tam genişlik silik dünya haritası — tüm sayacın arkasında */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/stats/world-map.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.22] mix-blend-soft-light brightness-110 contrast-125 sm:opacity-[0.28]"
        />
        <div className="absolute inset-0 bg-[#0B1E3F]/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-3 py-3 sm:px-6 md:py-4 lg:px-8">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-6 md:gap-0">
          {STATS.map(
            ({ key, value, suffix, image, imagePosition, imageTone }, index) => {
              const Icon = ICONS[key];
              const animated = displayValues.get(key) ?? 0;
              const isMap = imageTone === "map";

              return (
                <li
                  key={key}
                  className={cn(
                    "relative overflow-hidden rounded-xl md:rounded-none",
                    "min-h-[5.5rem] sm:min-h-[6rem]",
                    index < STATS.length - 1 &&
                      "md:border-r md:border-white/10",
                  )}
                >
                  {/* Hücre arka planı — ülke/kıta için harita yakın plan */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt=""
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover",
                      imagePosition,
                      isMap
                        ? "opacity-[0.35] mix-blend-soft-light brightness-110 contrast-125"
                        : "opacity-[0.16] grayscale",
                    )}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-[#0B1E3F]/65"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060b18]/75 via-[#0B1E3F]/35 to-[#0B1E3F]/50"
                    aria-hidden="true"
                  />

                  <div className="relative z-10 flex h-full flex-col items-center justify-center px-2 py-3 text-center md:px-3 md:py-4">
                    <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full border border-accent-500/30 bg-accent-500/10 md:mb-2 md:h-9 md:w-9">
                      <Icon
                        className="h-3.5 w-3.5 text-accent-400 md:h-4 md:w-4"
                        aria-hidden="true"
                      />
                    </div>
                    <p
                      className="text-xl font-extrabold tracking-tight text-accent-400 sm:text-2xl md:text-3xl"
                      aria-label={value}
                    >
                      {animated}
                      {suffix}
                    </p>
                    <p className="mt-0.5 text-[10px] font-medium text-primary-100/90 sm:text-xs md:text-sm">
                      {labels[key]}
                    </p>
                  </div>
                </li>
              );
            },
          )}
        </ul>
      </div>
    </section>
  );
}
