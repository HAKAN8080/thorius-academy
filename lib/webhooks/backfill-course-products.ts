import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  syncCourseProduct,
  type SyncCourseProductResult,
} from "@/lib/webhooks/sync-course-product";
import { revalidateCourseCache } from "@/lib/webhooks/revalidate-course-cache";
import type { WordPressCourseWebhookCourse } from "@/types/wordpress-webhook";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

const WC_STORE_BASE = `${
  process.env.NEXT_PUBLIC_WP_SITE_URL || "https://thorius.com.tr"
}/wp-json/wc/store/v1`;

interface WPCourseRow {
  id: number;
  slug: string;
  status: string;
  thorius_youtube?: {
    video_id?: string;
  } | null;
}

function isFreeYouTubeCourse(course: WPCourseRow): boolean {
  return Boolean(course.thorius_youtube?.video_id?.trim());
}

function buildFreeCoursePayload(course: WPCourseRow): WordPressCourseWebhookCourse {
  return {
    id: course.id,
    slug: course.slug,
    status: course.status,
    title: course.slug,
    wc_product_id: 0,
    price_normal: 0,
    price_sale: null,
    is_free: true,
  };
}

interface WooStoreProduct {
  id: number;
  slug: string;
  prices: {
    regular_price: string;
    sale_price: string;
    price: string;
    currency_minor_unit: number;
  };
}

export interface BackfillCourseProductsResult {
  success: boolean;
  totalCourses: number;
  totalProducts: number;
  synced: number;
  freeSynced: number;
  refreshed: number;
  skipped: number;
  failures: Array<{ slug: string; reason: string }>;
}

function parseStorePrice(
  raw: string | undefined,
  minorUnit: number,
): number | null {
  if (raw === undefined || raw === "") {
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  const divisor = Math.pow(10, minorUnit);
  return parsed / divisor;
}

function mapWooProductToCoursePayload(
  course: WPCourseRow,
  product: WooStoreProduct,
): WordPressCourseWebhookCourse {
  const minorUnit = product.prices.currency_minor_unit ?? 2;
  const priceNormal =
    parseStorePrice(product.prices.regular_price, minorUnit) ??
    parseStorePrice(product.prices.price, minorUnit);
  const saleRaw = product.prices.sale_price;
  const priceSale =
    saleRaw && saleRaw !== product.prices.regular_price
      ? parseStorePrice(saleRaw, minorUnit)
      : null;

  return {
    id: course.id,
    slug: course.slug,
    status: course.status,
    title: course.slug,
    wc_product_id: product.id,
    price_normal: priceNormal,
    price_sale: priceSale,
  };
}

async function fetchAllPublishedCourses(): Promise<WPCourseRow[]> {
  const firstRes = await fetch(
    `${WP_API_BASE}/courses?per_page=100&status=publish&_fields=id,slug,status,thorius_youtube`,
    { cache: "no-store" },
  );

  if (!firstRes.ok) {
    throw new Error(`WP courses fetch failed: ${firstRes.status}`);
  }

  const totalPages = parseInt(firstRes.headers.get("X-WP-TotalPages") || "1", 10);
  const firstBatch: WPCourseRow[] = await firstRes.json();

  if (totalPages <= 1) {
    return firstBatch;
  }

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => {
      const page = index + 2;
      return fetch(
        `${WP_API_BASE}/courses?per_page=100&status=publish&_fields=id,slug,status,thorius_youtube&page=${page}`,
        { cache: "no-store" },
      ).then(async (res) => {
        if (!res.ok) {
          return [] as WPCourseRow[];
        }
        return res.json() as Promise<WPCourseRow[]>;
      });
    }),
  );

  return [...firstBatch, ...remaining.flat()];
}

async function fetchAllWooStoreProducts(): Promise<WooStoreProduct[]> {
  const all: WooStoreProduct[] = [];
  let page = 1;

  while (page <= 50) {
    const res = await fetch(
      `${WC_STORE_BASE}/products?per_page=100&page=${page}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      throw new Error(`WC store products fetch failed: ${res.status}`);
    }

    const batch: WooStoreProduct[] = await res.json();
    if (!batch.length) {
      break;
    }

    all.push(...batch);
    if (batch.length < 100) {
      break;
    }
    page += 1;
  }

  return all;
}

async function refreshExistingProducts(
  productsById: Map<number, WooStoreProduct>,
): Promise<{ refreshed: number; failures: Array<{ slug: string; reason: string }> }> {
  const supabase = getSupabaseAdmin();
  const { data: existing, error } = await supabase
    .from("course_products")
    .select("id, course_slug, wp_course_id, wc_product_id");

  if (error || !existing) {
    return {
      refreshed: 0,
      failures: [{ slug: "*", reason: error?.message ?? "lookup_failed" }],
    };
  }

  let refreshed = 0;
  const failures: Array<{ slug: string; reason: string }> = [];

  for (const row of existing) {
    const product = productsById.get(row.wc_product_id);
    if (!product) {
      continue;
    }

    const payload: WordPressCourseWebhookCourse = mapWooProductToCoursePayload(
      {
        id: row.wp_course_id,
        slug: row.course_slug,
        status: "publish",
      },
      product,
    );

    const result = await syncCourseProduct(payload);
    if (result.synced) {
      refreshed += 1;
    } else if (result.reason) {
      failures.push({ slug: row.course_slug, reason: result.reason });
    }
  }

  return { refreshed, failures };
}

export async function backfillCourseProductsFromWordPress(): Promise<BackfillCourseProductsResult> {
  const failures: Array<{ slug: string; reason: string }> = [];
  let synced = 0;
  let freeSynced = 0;
  let skipped = 0;

  try {
    const [courses, wooProducts] = await Promise.all([
      fetchAllPublishedCourses(),
      fetchAllWooStoreProducts(),
    ]);

    const productsBySlug = new Map(wooProducts.map((product) => [product.slug, product]));
    const productsById = new Map(wooProducts.map((product) => [product.id, product]));

    const { refreshed, failures: refreshFailures } =
      await refreshExistingProducts(productsById);
    failures.push(...refreshFailures);

    const existingSlugs = new Set<string>();
    const supabase = getSupabaseAdmin();
    const { data: existingRows } = await supabase
      .from("course_products")
      .select("course_slug");
    for (const row of existingRows ?? []) {
      existingSlugs.add(row.course_slug);
    }

    for (const course of courses) {
      if (existingSlugs.has(course.slug)) {
        continue;
      }

      const product = productsBySlug.get(course.slug);
      if (!product) {
        if (isFreeYouTubeCourse(course)) {
          const freeResult = await syncCourseProduct(buildFreeCoursePayload(course));
          if (freeResult.synced) {
            freeSynced += 1;
            existingSlugs.add(course.slug);
          } else {
            skipped += 1;
            if (freeResult.reason) {
              failures.push({ slug: course.slug, reason: freeResult.reason });
            }
          }
        } else {
          skipped += 1;
        }
        continue;
      }

      const payload = mapWooProductToCoursePayload(course, product);
      const result: SyncCourseProductResult = await syncCourseProduct(payload);

      if (result.synced) {
        synced += 1;
        existingSlugs.add(course.slug);
      } else {
        skipped += 1;
        if (result.reason) {
          failures.push({ slug: course.slug, reason: result.reason });
        }
      }
    }

    revalidateCourseCache();

    return {
      success: true,
      totalCourses: courses.length,
      totalProducts: wooProducts.length,
      synced,
      freeSynced,
      refreshed,
      skipped,
      failures,
    };
  } catch (error) {
    return {
      success: false,
      totalCourses: 0,
      totalProducts: 0,
      synced,
      freeSynced,
      refreshed: 0,
      skipped,
      failures: [
        {
          slug: "*",
          reason: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}
