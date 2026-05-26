import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { FREE_COURSE_WC_PRODUCT_ID } from "@/lib/course/course-product-utils";
import { revalidateCourseCache } from "@/lib/webhooks/revalidate-course-cache";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

const WC_STORE_BASE = `${
  process.env.NEXT_PUBLIC_WP_SITE_URL || "https://thorius.com.tr"
}/wp-json/wc/store/v1`;

const UPSERT_BATCH_SIZE = 100;

interface WPCourseRow {
  id: number;
  slug: string;
  status: string;
  thorius_youtube?: {
    video_id?: string;
  } | null;
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

interface CourseProductRow {
  course_slug: string;
  wp_course_id: number;
  wc_product_id: number;
  price_normal: number | null;
  price_sale: number | null;
  currency: string;
  is_active: boolean;
}

interface ExistingCourseProduct {
  course_slug: string;
  wp_course_id: number;
  wc_product_id: number;
}

export interface BackfillCourseProductsOptions {
  /** 1-based WP courses API page. Omit to process all courses. */
  wpPage?: number;
  /** Only register missing YouTube free courses (fast path). */
  freeOnly?: boolean;
}

export interface BackfillCourseProductsResult {
  success: boolean;
  totalCourses: number;
  totalProducts: number;
  synced: number;
  freeSynced: number;
  refreshed: number;
  skipped: number;
  upserted: number;
  wpPage?: number;
  wpTotalPages?: number;
  hasMore?: boolean;
  nextWpPage?: number;
  failures: Array<{ slug: string; reason: string }>;
}

function isFreeYouTubeCourse(course: WPCourseRow): boolean {
  return Boolean(course.thorius_youtube?.video_id?.trim());
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

  return parsed / Math.pow(10, minorUnit);
}

function buildPaidRow(
  course: WPCourseRow,
  product: WooStoreProduct,
): CourseProductRow {
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
    course_slug: course.slug,
    wp_course_id: course.id,
    wc_product_id: product.id,
    price_normal: priceNormal,
    price_sale: priceSale,
    currency: "TRY",
    is_active: course.status === "publish",
  };
}

function buildFreeRow(course: WPCourseRow): CourseProductRow {
  return {
    course_slug: course.slug,
    wp_course_id: course.id,
    wc_product_id: FREE_COURSE_WC_PRODUCT_ID,
    price_normal: 0,
    price_sale: null,
    currency: "TRY",
    is_active: course.status === "publish",
  };
}

async function fetchPublishedCoursesPage(
  page: number,
): Promise<{ courses: WPCourseRow[]; totalPages: number }> {
  const res = await fetch(
    `${WP_API_BASE}/courses?per_page=100&status=publish&_fields=id,slug,status,thorius_youtube&page=${page}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`WP courses fetch failed: ${res.status}`);
  }

  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
  const courses: WPCourseRow[] = await res.json();
  return { courses, totalPages };
}

async function fetchAllPublishedCourses(): Promise<WPCourseRow[]> {
  const { courses: firstBatch, totalPages } = await fetchPublishedCoursesPage(1);

  if (totalPages <= 1) {
    return firstBatch;
  }

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchPublishedCoursesPage(index + 2).then((result) => result.courses),
    ),
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

async function fetchExistingCourseProducts(): Promise<ExistingCourseProduct[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("course_products")
    .select("course_slug, wp_course_id, wc_product_id");

  if (error || !data) {
    throw new Error(error?.message ?? "course_products lookup failed");
  }

  return data as ExistingCourseProduct[];
}

async function persistCourseProductRows(
  rows: CourseProductRow[],
  existingByWpId: Map<number, ExistingCourseProduct>,
): Promise<{ upserted: number; error?: string }> {
  if (rows.length === 0) {
    return { upserted: 0 };
  }

  const supabase = getSupabaseAdmin();
  const toInsert = rows.filter((row) => !existingByWpId.has(row.wp_course_id));
  const toUpdate = rows.filter((row) => existingByWpId.has(row.wp_course_id));
  let upserted = 0;

  for (let index = 0; index < toInsert.length; index += UPSERT_BATCH_SIZE) {
    const chunk = toInsert.slice(index, index + UPSERT_BATCH_SIZE);
    const { error } = await supabase.from("course_products").insert(chunk);

    if (error) {
      return { upserted, error: error.message };
    }

    upserted += chunk.length;
  }

  const UPDATE_CONCURRENCY = 20;
  for (let index = 0; index < toUpdate.length; index += UPDATE_CONCURRENCY) {
    const chunk = toUpdate.slice(index, index + UPDATE_CONCURRENCY);
    const results = await Promise.all(
      chunk.map((row) =>
        supabase
          .from("course_products")
          .update({
            course_slug: row.course_slug,
            wc_product_id: row.wc_product_id,
            price_normal: row.price_normal,
            price_sale: row.price_sale,
            currency: row.currency,
            is_active: row.is_active,
          })
          .eq("wp_course_id", row.wp_course_id),
      ),
    );

    const failed = results.find((result) => result.error);
    if (failed?.error) {
      return { upserted, error: failed.error.message };
    }

    upserted += chunk.length;
  }

  return { upserted };
}

function buildRowsForCourses(params: {
  courses: WPCourseRow[];
  productsBySlug: Map<string, WooStoreProduct>;
  existingByWpId: Map<number, ExistingCourseProduct>;
  freeOnly: boolean;
}): {
  rows: CourseProductRow[];
  synced: number;
  freeSynced: number;
  skipped: number;
} {
  const rows: CourseProductRow[] = [];
  let synced = 0;
  let freeSynced = 0;
  let skipped = 0;

  for (const course of params.courses) {
    if (params.existingByWpId.has(course.id)) {
      if (params.freeOnly) {
        skipped += 1;
      }
      continue;
    }

    const product = params.productsBySlug.get(course.slug);
    if (product && !params.freeOnly) {
      rows.push(buildPaidRow(course, product));
      synced += 1;
      continue;
    }

    if (isFreeYouTubeCourse(course)) {
      rows.push(buildFreeRow(course));
      freeSynced += 1;
      continue;
    }

    if (!params.freeOnly) {
      skipped += 1;
    }
  }

  return { rows, synced, freeSynced, skipped };
}

function buildRefreshRows(params: {
  existing: ExistingCourseProduct[];
  productsById: Map<number, WooStoreProduct>;
}): { rows: CourseProductRow[]; refreshed: number } {
  const rows: CourseProductRow[] = [];
  let refreshed = 0;

  for (const existing of params.existing) {
    if (existing.wc_product_id <= 0) {
      continue;
    }

    const product = params.productsById.get(existing.wc_product_id);
    if (!product) {
      continue;
    }

    rows.push(
      buildPaidRow(
        {
          id: existing.wp_course_id,
          slug: existing.course_slug,
          status: "publish",
        },
        product,
      ),
    );
    refreshed += 1;
  }

  return { rows, refreshed };
}

export async function backfillCourseProductsFromWordPress(
  options: BackfillCourseProductsOptions = {},
): Promise<BackfillCourseProductsResult> {
  const failures: Array<{ slug: string; reason: string }> = [];
  let synced = 0;
  let freeSynced = 0;
  let refreshed = 0;
  let skipped = 0;
  let upserted = 0;

  try {
    let courses: WPCourseRow[];
    let wpTotalPages: number | undefined;
    const wpPage = options.wpPage;
    let hasMore = false;
    let nextWpPage: number | undefined;

    if (wpPage && wpPage > 0) {
      const pageResult = await fetchPublishedCoursesPage(wpPage);
      courses = pageResult.courses;
      wpTotalPages = pageResult.totalPages;
      hasMore = wpPage < pageResult.totalPages;
      if (hasMore) {
        nextWpPage = wpPage + 1;
      }
    } else {
      courses = await fetchAllPublishedCourses();
    }

    const freeOnly = options.freeOnly === true;
    const wooProducts = freeOnly
      ? []
      : await fetchAllWooStoreProducts();
    const productsBySlug = new Map(
      wooProducts.map((product) => [product.slug, product]),
    );
    const productsById = new Map(
      wooProducts.map((product) => [product.id, product]),
    );

    const existing = await fetchExistingCourseProducts();
    const existingByWpId = new Map(
      existing.map((row) => [row.wp_course_id, row]),
    );

    const courseRows = buildRowsForCourses({
      courses,
      productsBySlug,
      existingByWpId,
      freeOnly,
    });

    synced = courseRows.synced;
    freeSynced = courseRows.freeSynced;
    skipped = courseRows.skipped;

    const refreshRows = freeOnly
      ? { rows: [], refreshed: 0 }
      : buildRefreshRows({ existing, productsById });
    refreshed = refreshRows.refreshed;

    const rowMap = new Map<number, CourseProductRow>();
    for (const row of [...courseRows.rows, ...refreshRows.rows]) {
      rowMap.set(row.wp_course_id, row);
    }

    const upsertResult = await persistCourseProductRows(
      Array.from(rowMap.values()),
      existingByWpId,
    );
    upserted = upsertResult.upserted;

    if (upsertResult.error) {
      failures.push({ slug: "*", reason: upsertResult.error });
    }

    if (!wpPage || !hasMore) {
      revalidateCourseCache();
    }

    return {
      success: !upsertResult.error,
      totalCourses: courses.length,
      totalProducts: wooProducts.length,
      synced,
      freeSynced,
      refreshed,
      skipped,
      upserted,
      wpPage,
      wpTotalPages,
      hasMore,
      nextWpPage,
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
      upserted,
      failures: [
        {
          slug: "*",
          reason: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}
