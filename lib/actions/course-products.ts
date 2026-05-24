"use server";

import { createClient } from "@/lib/supabase/server";
import type { CourseProduct } from "@/types/course-product";

export async function getCourseProduct(
  courseSlug: string,
): Promise<CourseProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_products")
    .select("*")
    .eq("course_slug", courseSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as CourseProduct;
}

export async function getAllCourseProducts(): Promise<CourseProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_products")
    .select("*")
    .eq("is_active", true);

  if (error || !data) return [];
  return data as CourseProduct[];
}
