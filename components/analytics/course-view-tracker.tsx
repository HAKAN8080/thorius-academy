"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/analytics/tracking";

interface CourseViewTrackerProps {
  courseSlug: string;
  courseTitle: string;
  price: number | null;
}

export function CourseViewTracker({
  courseSlug,
  courseTitle,
  price,
}: CourseViewTrackerProps) {
  useEffect(() => {
    trackViewContent({
      id: courseSlug,
      name: courseTitle,
      price,
      currency: "TRY",
    });
  }, [courseSlug, courseTitle, price]);

  return null;
}
