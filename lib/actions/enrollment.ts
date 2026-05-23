"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
