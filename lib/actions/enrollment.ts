"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolveCourseProduct } from "@/lib/course/resolve-course-product";
import { isFreeCourseProduct } from "@/lib/course/course-product-utils";
import { syncEnrollmentToWp } from "@/lib/tutor/sync-enrollment-to-wp";
import type { EnrollResult, Enrollment } from "@/types/enrollment";

interface EnrollParams {
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  courseImage?: string | null;
  courseCategory?: string | null;
  instructorName?: string | null;
}

export async function enrollInCourse(params: EnrollParams): Promise<EnrollResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Kursa kayıt olmak için giriş yapmalısınız",
        needsLogin: true,
      };
    }

    const courseProduct = await resolveCourseProduct({
      courseSlug: params.courseSlug,
      wpCourseId: params.courseId,
    });
    if (!courseProduct) {
      return {
        success: false,
        error:
          "Bu kurs için kayıt şu an açık değil. Lütfen satın alma veya destek ekibiyle iletişime geçin.",
      };
    }

    if (!isFreeCourseProduct(courseProduct)) {
      return {
        success: false,
        error: "Bu kursa kayıt olmak için önce satın almanız gerekiyor.",
      };
    }

    const { data, error } = await supabase
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: params.courseId,
        course_slug: params.courseSlug,
        course_title: params.courseTitle,
        course_image: params.courseImage ?? null,
        course_category: params.courseCategory ?? null,
        instructor_name: params.instructorName ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return {
          success: false,
          error: "Bu kursa zaten kayıtlısınız",
          alreadyEnrolled: true,
        };
      }
      console.error("Enrollment error:", error);
      return {
        success: false,
        error: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      };
    }

    revalidatePath("/panel");
    revalidatePath("/panel/kurslarim");
    revalidatePath(`/kurslar/${params.courseSlug}`);

    const wpCourseId = courseProduct.wp_course_id || params.courseId;
    if (user.email && wpCourseId > 0) {
      const syncResult = await syncEnrollmentToWp({
        email: user.email,
        fullName:
          (typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : null) ?? null,
        wpCourseId,
      });

      if (!syncResult.success && !syncResult.skipped) {
        console.warn(
          `[Enrollment] Tutor sync failed for ${params.courseSlug}:`,
          syncResult.error,
        );
      }
    }

    return { success: true, enrollment: data as Enrollment };
  } catch (error) {
    console.error("Enrollment error:", error);
    return {
      success: false,
      error: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}

export async function getUserEnrollments(): Promise<Enrollment[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "cancelled")
      .order("enrolled_at", { ascending: false });

    if (error) {
      console.error("Get enrollments error:", error);
      return [];
    }

    return data as Enrollment[];
  } catch (error) {
    console.error("Get enrollments error:", error);
    return [];
  }
}

export async function checkEnrollment(
  courseId: number
): Promise<Enrollment | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .neq("status", "cancelled")
      .maybeSingle();

    if (error || !data) return null;
    return data as Enrollment;
  } catch (error) {
    console.error("Check enrollment error:", error);
    return null;
  }
}

export async function unenrollFromCourse(
  courseId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Giriş yapmalısınız" };
    }

    const { error } = await supabase
      .from("enrollments")
      .update({ status: "cancelled" })
      .eq("user_id", user.id)
      .eq("course_id", courseId);

    if (error) {
      return { success: false, error: "İptal sırasında hata oluştu" };
    }

    revalidatePath("/panel/kurslarim");
    return { success: true };
  } catch (error) {
    console.error("Unenroll error:", error);
    return { success: false, error: "İptal sırasında hata oluştu" };
  }
}
