import { getCourseProduct } from "@/lib/actions/course-products";
import { FREE_COURSE_WC_PRODUCT_ID } from "@/lib/course/course-product-utils";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { COURSE_PRODUCTS_CACHE_TAG } from "@/lib/wordpress/cache-tags";
import { revalidateTag } from "next/cache";
import type { CourseProduct } from "@/types/course-product";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

interface WPCourseProductSource {
  id: number;
  slug: string;
  status: string;
  thorius_youtube?: {
    video_id?: string;
  } | null;
}

async function fetchCourseProductSource(
  wpCourseId: number,
): Promise<WPCourseProductSource | null> {
  const res = await fetch(
    `${WP_API_BASE}/courses/${wpCourseId}?_fields=id,slug,status,thorius_youtube`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return null;
  }

  return res.json() as Promise<WPCourseProductSource>;
}

function hasYoutubeVideo(course: WPCourseProductSource): boolean {
  return Boolean(course.thorius_youtube?.video_id?.trim());
}

async function registerFreeCourseProduct(
  course: WPCourseProductSource,
): Promise<CourseProduct | null> {
  const supabase = getSupabaseAdmin();
  const row = {
    course_slug: course.slug,
    wp_course_id: course.id,
    wc_product_id: FREE_COURSE_WC_PRODUCT_ID,
    price_normal: 0,
    price_sale: null,
    currency: "TRY",
    is_active: course.status === "publish",
  };

  const { data, error } = await supabase
    .from("course_products")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return getCourseProduct(course.slug);
    }

    console.error("[CourseProduct] free YouTube register failed:", error.message);
    return null;
  }

  revalidateTag(COURSE_PRODUCTS_CACHE_TAG);
  return data as CourseProduct;
}

export async function resolveCourseProduct(options: {
  courseSlug: string;
  wpCourseId: number;
  youtubeVideoId?: string | null;
}): Promise<CourseProduct | null> {
  for (const slug of getCourseSlugLookupVariants(options.courseSlug)) {
    const existing = await getCourseProduct(slug);
    if (existing) {
      return existing;
    }
  }

  if (options.youtubeVideoId?.trim()) {
    const course = await fetchCourseProductSource(options.wpCourseId);
    if (course && hasYoutubeVideo(course)) {
      return registerFreeCourseProduct(course);
    }
  }

  const course = await fetchCourseProductSource(options.wpCourseId);
  if (!course || !hasYoutubeVideo(course)) {
    return null;
  }

  return registerFreeCourseProduct(course);
}
