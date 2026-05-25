import { getSupabaseAdmin } from "@/lib/supabase/admin";
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

export async function syncCourseProduct(
  course: WordPressCourseWebhookCourse,
): Promise<SyncCourseProductResult> {
  const wcProductId = course.wc_product_id;
  if (!wcProductId) {
    return { synced: false, reason: "no_wc_product" };
  }

  const priceNormal = parsePrice(course.price_normal);
  const priceSale = parsePrice(course.price_sale);

  if (priceNormal === null && priceSale === null) {
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
      wc_product_id: wcProductId,
      price_normal: priceNormal,
      price_sale: priceSale,
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
