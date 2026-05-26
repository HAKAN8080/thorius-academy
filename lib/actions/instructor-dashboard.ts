"use server";

import { createClient } from "@/lib/supabase/server";
import { requireInstructorAccess } from "@/lib/instructor/access";
import type {
  InstructorCourseReview,
  InstructorCourseStats,
} from "@/types/instructor";

export async function getInstructorCourses(): Promise<InstructorCourseStats[]> {
  const { wpInstructorId } = await requireInstructorAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("instructor_course_stats")
    .select("*")
    .eq("instructor_wp_user_id", wpInstructorId)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[Instructor Dashboard] getInstructorCourses:", error.message);
    return [];
  }

  return (data ?? []) as InstructorCourseStats[];
}

export async function getInstructorCourseBySlug(
  slug: string,
): Promise<InstructorCourseStats | null> {
  const { wpInstructorId } = await requireInstructorAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("instructor_course_stats")
    .select("*")
    .eq("course_slug", slug)
    .eq("instructor_wp_user_id", wpInstructorId)
    .maybeSingle();

  if (error) {
    console.error(
      "[Instructor Dashboard] getInstructorCourseBySlug:",
      error.message,
    );
    return null;
  }

  return (data as InstructorCourseStats | null) ?? null;
}

export async function getCourseReviews(
  wpCourseId: number,
): Promise<InstructorCourseReview[]> {
  await requireInstructorAccess();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("instructor_course_reviews")
    .select("*")
    .eq("wp_course_id", wpCourseId)
    .order("reviewed_at", { ascending: false });

  if (error) {
    console.error("[Instructor Dashboard] getCourseReviews:", error.message);
    return [];
  }

  return (data ?? []) as InstructorCourseReview[];
}
