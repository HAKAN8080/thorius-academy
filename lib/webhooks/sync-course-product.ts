import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { FREE_COURSE_WC_PRODUCT_ID } from "@/lib/course/course-product-utils";
import type { WordPressCourseWebhookCourse } from "@/types/wordpress-webhook";

export interface SyncCourseProductResult {
  synced: boolean;
  reason?: string;
}

function parsePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function isExplicitlyFreeCourse(course: WordPressCourseWebhookCourse): boolean {
  if (course.is_free === true) {
    return true;
  }

  const priceNormal = parsePrice(course.price_normal);
  const priceSale = parsePrice(course.price_sale);

  return (
    priceNormal === 0 &&
    (priceSale === null || priceSale === 0) &&
    (!course.wc_product_id || course.wc_product_id === FREE_COURSE_WC_PRODUCT_ID)
  );
}

export async function syncCourseProduct(
  course: WordPressCourseWebhookCourse,
): Promise<SyncCourseProductResult> {
  const wcProductId = course.wc_product_id ?? FREE_COURSE_WC_PRODUCT_ID;
  const priceNormal = parsePrice(course.price_normal);
  const priceSale = parsePrice(course.price_sale);
  const isFree = isExplicitlyFreeCourse(course);

  if (!isFree && wcProductId <= 0) {
    return { synced: false, reason: "no_wc_product" };
  }

  if (!isFree && priceNormal === null && priceSale === null) {
    return { synced: false, reason: "no_price" };
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: existing, error: lookupError } = await supabase
      .from("course_products")
      .select("id")
      .eq("wp_course_id", course.id)
      .maybeSingle();

    if (lookupError) {
      console.error("[WP Webhook] course_products lookup failed:", lookupError.message);
      return { synced: false, reason: lookupError.message };
    }

    const row = {
      course_slug: course.slug,
      wp_course_id: course.id,
      wc_product_id: isFree ? FREE_COURSE_WC_PRODUCT_ID : wcProductId,
      price_normal: isFree ? 0 : priceNormal,
      price_sale: isFree ? null : priceSale,
      currency: "TRY",
      is_active: course.status === "publish",
    };

    if (existing?.id) {
      const { error } = await supabase
        .from("course_products")
        .update(row)
        .eq("id", existing.id);

      if (error) {
        console.error("[WP Webhook] course_products update failed:", error.message);
        return { synced: false, reason: error.message };
      }

      return { synced: true };
    }

    const { error } = await supabase.from("course_products").insert(row);

    if (error) {
      console.error("[WP Webhook] course_products insert failed:", error.message);
      return { synced: false, reason: error.message };
    }

    return { synced: true };
  } catch (error) {
    console.error("[WP Webhook] course_products sync exception:", error);
    return {
      synced: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}
