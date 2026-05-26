"use server";

import { unstable_cache } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { COURSE_PRODUCTS_CACHE_TAG } from "@/lib/wordpress/cache-tags";
import type { CourseProduct } from "@/types/course-product";

const REVALIDATE_SECONDS = 3600;

async function fetchAllCourseProductsUncached(): Promise<CourseProduct[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("course_products")
    .select("*")
    .eq("is_active", true);

  if (error || !data) {
    return [];
  }

  return data as CourseProduct[];
}

const getCachedCourseProducts = unstable_cache(
  fetchAllCourseProductsUncached,
  ["all-course-products"],
  { revalidate: REVALIDATE_SECONDS, tags: [COURSE_PRODUCTS_CACHE_TAG] },
);

export async function getAllCourseProducts(): Promise<CourseProduct[]> {
  return getCachedCourseProducts();
}

export async function getCourseProduct(
  courseSlug: string,
): Promise<CourseProduct | null> {
  const products = await getAllCourseProducts();
  const slugVariants = getCourseSlugLookupVariants(courseSlug);

  for (const slug of slugVariants) {
    const match = products.find((product) => product.course_slug === slug);
    if (match) {
      return match;
    }
  }

  return null;
}
