import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { checkEnrollment } from "@/lib/actions/enrollment";
import { resolveCourseProduct } from "@/lib/course/resolve-course-product";
import { splitFullName } from "@/lib/course/checkout-url";
import type { CheckoutCustomer } from "@/lib/course/checkout-url";
import type { CourseProduct } from "@/types/course-product";
import type { Course } from "@/types/wordpress";

export interface CoursePurchaseState {
  isLoggedIn: boolean;
  isAlreadyEnrolled: boolean;
  courseProduct: CourseProduct | null;
  customer: CheckoutCustomer | null;
}

export const getCoursePurchaseState = cache(
  async (
    course: Pick<Course, "id" | "slug" | "youtubeVideoId">,
  ): Promise<CoursePurchaseState> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const enrollment = user ? await checkEnrollment(course.id) : null;
    const courseProduct = await resolveCourseProduct({
      courseSlug: course.slug,
      wpCourseId: course.id,
      youtubeVideoId: course.youtubeVideoId,
    });

    let customer: CheckoutCustomer | null = null;
    if (user?.email) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const metadataName =
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : "";
      const { firstName, lastName } = splitFullName(
        profile?.full_name ?? metadataName,
      );

      customer = {
        email: user.email,
        firstName,
        lastName,
      };
    }

    return {
      isLoggedIn: Boolean(user),
      isAlreadyEnrolled: Boolean(enrollment),
      courseProduct,
      customer,
    };
  },
);
