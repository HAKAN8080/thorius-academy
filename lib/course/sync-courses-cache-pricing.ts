import { revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  isFreeCourseProduct,
  isPurchasableCourseProduct,
} from "@/lib/course/course-product-utils";
import {
  COURSE_CACHE_TAG,
  COURSE_PRODUCTS_CACHE_TAG,
} from "@/lib/wordpress/cache-tags";
import type { CourseProduct } from "@/types/course-product";

interface SyncCoursesCachePricingOptions {
  slug?: string;
  dryRun?: boolean;
}

interface SyncCoursesCachePricingResult {
  matched: number;
  updated: number;
  skipped: number;
}

function pricingFromProduct(product: CourseProduct): {
  pricing_model: "free" | "paid";
  price: number;
  sale_price: number | null;
} | null {
  if (isPurchasableCourseProduct(product)) {
    return {
      pricing_model: "paid",
      price: product.price_normal ?? 0,
      sale_price: product.price_sale,
    };
  }

  if (isFreeCourseProduct(product)) {
    return {
      pricing_model: "free",
      price: 0,
      sale_price: null,
    };
  }

  return null;
}

export async function syncCoursesCachePricingFromProducts(
  options: SyncCoursesCachePricingOptions = {},
): Promise<SyncCoursesCachePricingResult> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("course_products").select("*").eq("is_active", true);

  if (options.slug) {
    query = query.eq("course_slug", options.slug);
  }

  const { data: products, error } = await query;

  if (error) {
    throw new Error(`course_products fetch failed: ${error.message}`);
  }

  let matched = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of (products ?? []) as CourseProduct[]) {
    const pricing = pricingFromProduct(product);
    if (!pricing) {
      skipped += 1;
      continue;
    }

    matched += 1;

    if (options.dryRun) {
      console.log(
        `[dry-run] ${product.course_slug}: ${pricing.pricing_model} ${pricing.price}/${pricing.sale_price ?? "-"}`,
      );
      updated += 1;
      continue;
    }

    const { error: updateError } = await supabase
      .from("courses_cache")
      .update(pricing)
      .eq("course_slug", product.course_slug);

    if (updateError) {
      console.error(
        `[sync-pricing] ${product.course_slug} update failed:`,
        updateError.message,
      );
      skipped += 1;
      continue;
    }

    updated += 1;
  }

  if (!options.dryRun && updated > 0) {
    revalidateTag(COURSE_CACHE_TAG);
    revalidateTag(COURSE_PRODUCTS_CACHE_TAG);
    revalidateTag("courses-cache-catalog");
  }

  return { matched, updated, skipped };
}
