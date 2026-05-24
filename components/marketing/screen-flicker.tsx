"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScreenFlickerProps {
  /** Slide index — değişince efekt tetiklenir */
  trigger: number;
  children: ReactNode;
  className?: string;
}

export function ScreenFlicker({
  trigger,
  children,
  className,
}: ScreenFlickerProps) {
  const [active, setActive] = useState(false);
  const skipFirst = useRef(true);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }

    if (reducedMotionRef.current) return;

    setActive(true);
    const timer = window.setTimeout(() => setActive(false), 400);
    return () => window.clearTimeout(timer);
  }, [trigger]);

  return (
    <div
      className={cn(
        "screen-flicker-root relative overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "screen-flicker-content h-full w-full",
          active && "screen-flicker-content--reveal",
        )}
      >
        {children}
      </div>

      {active && (
        <div
          className="gold-line-transition pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/** @deprecated ScreenFlicker kullanın */
export const ScreenFlickerWrap = ScreenFlicker;
