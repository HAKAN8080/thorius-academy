"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Clock, Globe2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  countries: Globe2,
  students: Users,
  hours: Clock,
  courses: BookOpen,
};

const STATS = [
  { key: "countries", value: "28", numericTarget: 28, suffix: "" },
  { key: "students", value: "500+", numericTarget: 500, suffix: "+" },
  { key: "hours", value: "170+", numericTarget: 170, suffix: "+" },
  { key: "courses", value: "220+", numericTarget: 220, suffix: "+" },
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
      className="relative border-b border-accent-500/25 bg-gradient-to-r from-[#060b18] via-[#0B1E3F] to-[#060b18]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 md:py-4 lg:px-8">
        <ul className="grid grid-cols-2 gap-y-3 gap-x-3 md:grid-cols-4 md:gap-0">
          {STATS.map(({ key, value, suffix }, index) => {
            const Icon = ICONS[key];
            const animated = displayValues.get(key) ?? 0;

            return (
              <li
                key={key}
                className={cn(
                  "flex flex-col items-center px-2 text-center md:px-6",
                  index < STATS.length - 1 &&
                    "md:border-r md:border-white/10",
                  index % 2 === 0 &&
                    "max-md:border-r max-md:border-white/10",
                )}
              >
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
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
