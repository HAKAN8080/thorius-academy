"use client";

import { useEffect, useState } from "react";
import { CoursePurchaseCta } from "@/components/course/course-purchase-cta";
import { CourseDetailPurchasePanelSkeleton } from "@/components/course/course-detail-purchase-skeleton";
import type { CheckoutCustomer } from "@/lib/course/checkout-url";
import type { CourseProduct } from "@/types/course-product";
import type { Course } from "@/types/wordpress";

interface CourseDetailPurchaseClientProps {
  course: Pick<
    Course,
    | "id"
    | "slug"
    | "title"
    | "featuredImage"
    | "categories"
    | "instructor"
    | "youtubeVideoId"
  >;
  /** Cached product from RSC — avoids waiting on auth for price CTA. */
  initialProduct: CourseProduct | null;
  theme?: "light" | "dark";
}

type PurchaseStatePayload = {
  isLoggedIn: boolean;
  isAlreadyEnrolled: boolean;
  courseProduct: CourseProduct | null;
  customer: CheckoutCustomer | null;
};

export function CourseDetailPurchaseClient({
  course,
  initialProduct,
  theme = "light",
}: CourseDetailPurchaseClientProps) {
  const [state, setState] = useState<PurchaseStatePayload>({
    isLoggedIn: false,
    isAlreadyEnrolled: false,
    courseProduct: initialProduct,
    customer: null,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const params = new URLSearchParams({
      courseId: String(course.id),
      slug: course.slug,
    });
    if (course.youtubeVideoId) {
      params.set("youtubeVideoId", course.youtubeVideoId);
    }

    fetch(`/api/course/purchase-state?${params.toString()}`, {
      signal: controller.signal,
      credentials: "same-origin",
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as PurchaseStatePayload;
      })
      .then((payload) => {
        if (cancelled || !payload) {
          setReady(true);
          return;
        }
        setState({
          isLoggedIn: Boolean(payload.isLoggedIn),
          isAlreadyEnrolled: Boolean(payload.isAlreadyEnrolled),
          courseProduct: payload.courseProduct ?? initialProduct,
          customer: payload.customer ?? null,
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [course.id, course.slug, course.youtubeVideoId, initialProduct]);

  if (!ready && !initialProduct && !course.youtubeVideoId) {
    return <CourseDetailPurchasePanelSkeleton />;
  }

  return (
    <CoursePurchaseCta
      courseId={course.id}
      courseSlug={course.slug}
      courseTitle={course.title}
      courseImage={course.featuredImage}
      courseCategory={course.categories[0]?.name}
      instructorName={course.instructor?.name}
      isFreeYoutubeCourse={Boolean(course.youtubeVideoId)}
      theme={theme}
      isLoggedIn={state.isLoggedIn}
      isAlreadyEnrolled={state.isAlreadyEnrolled}
      courseProduct={state.courseProduct}
      customer={state.customer}
    />
  );
}
