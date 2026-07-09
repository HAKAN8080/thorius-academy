import { unstable_cache } from "next/cache";
import { getAllCourseProducts } from "@/lib/actions/course-products";
import { getAllCourseStats } from "@/lib/actions/course-stats";
import { resolveCourseLanguageMeta } from "@/lib/course/course-language";
import { fromCoursesCacheLevelLabel } from "@/lib/instructor/courses-cache-write";
import { getSupabasePublicClient } from "@/lib/supabase/public";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatDuration } from "@/lib/utils/duration";
import type { FeaturedCourseSpotlight } from "@/types/featured-course-spotlight";

const REVALIDATE_SECONDS = 3600;
const DEFAULT_LIMIT = 3;

const SPOTLIGHT_SELECT =
  "id,course_slug,wp_course_id,title,subtitle,description_md,cover_image_url,category,level,language,subtitle_language,what_will_learn,target_audience,instructor_wp_user_id,pricing_model,price,sale_price,updated_at";

function excerptFromMarkdown(
  markdown: string | null | undefined,
  max = 220,
): string {
  if (!markdown?.trim()) {
    return "";
  }

  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function parseBulletField(value: string | null | undefined, max = 4): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(/\r?\n|•|·|;/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, max);
}

function configuredSpotlightSlugs(): string[] {
  const raw = process.env.HOMEPAGE_SPOTLIGHT_SLUGS?.trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

async function fetchSpotlightRows(limit: number) {
  const supabase = getSupabasePublicClient();
  const pinnedSlugs = configuredSpotlightSlugs();

  if (pinnedSlugs.length > 0) {
    const { data, error } = await supabase
      .from("courses_cache")
      .select(SPOTLIGHT_SELECT)
      .eq("published", true)
      .eq("visibility", "public")
      .in("course_slug", pinnedSlugs);

    if (error) {
      console.error("[featured-course-spotlight] pinned fetch failed:", error.message);
      return [];
    }

    const bySlug = new Map(
      (data ?? []).map((row) => [
        row.course_slug as string,
        row as Record<string, unknown>,
      ]),
    );

    return pinnedSlugs
      .map((slug) => bySlug.get(slug))
      .filter((row): row is Record<string, unknown> => Boolean(row))
      .slice(0, limit);
  }

  const { data, error } = await supabase
    .from("courses_cache")
    .select(SPOTLIGHT_SELECT)
    .eq("published", true)
    .eq("visibility", "public")
    .not("course_slug", "is", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[featured-course-spotlight] listing fetch failed:", error.message);
    return [];
  }

  return (data ?? []) as Record<string, unknown>[];
}

async function buildFeaturedCourseSpotlights(
  limit = DEFAULT_LIMIT,
): Promise<FeaturedCourseSpotlight[]> {
  const rows = await fetchSpotlightRows(limit);
  if (rows.length === 0) {
    return [];
  }

  const slugs = rows
    .map((row) => (row.course_slug as string | null)?.trim())
    .filter((slug): slug is string => Boolean(slug));

  const instructorIds = Array.from(
    new Set(
      rows
        .map((row) => Number(row.instructor_wp_user_id ?? 0))
        .filter((id) => id > 0),
    ),
  );

  const [products, stats, instructors, attachmentRows] = await Promise.all([
    getAllCourseProducts(),
    getAllCourseStats(),
    fetchInstructors(instructorIds),
    fetchLessonAttachments(slugs),
  ]);

  const productBySlug = new Map(products.map((product) => [product.course_slug, product]));

  return rows
    .map((row) => mapSpotlightRow(row, {
      productBySlug,
      stats,
      instructors,
      attachmentsBySlug: attachmentRows,
    }))
    .filter((spotlight): spotlight is FeaturedCourseSpotlight => spotlight !== null);
}

async function fetchInstructors(
  instructorIds: number[],
): Promise<Map<number, { full_name: string | null; avatar_url: string | null }>> {
  const map = new Map<number, { full_name: string | null; avatar_url: string | null }>();
  if (instructorIds.length === 0) {
    return map;
  }

  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("instructors")
      .select("wp_user_id, full_name, avatar_url")
      .in("wp_user_id", instructorIds);

    for (const row of data ?? []) {
      map.set(Number(row.wp_user_id), {
        full_name: (row.full_name as string | null) ?? null,
        avatar_url: (row.avatar_url as string | null) ?? null,
      });
    }
  } catch (error) {
    console.error("[featured-course-spotlight] instructor fetch failed:", error);
  }

  return map;
}

async function fetchLessonAttachments(
  slugs: string[],
): Promise<Map<string, FeaturedCourseSpotlight["attachments"]>> {
  const map = new Map<string, FeaturedCourseSpotlight["attachments"]>();
  if (slugs.length === 0) {
    return map;
  }

  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("lessons")
      .select(
        "course_slug, attachment_url, attachment_name, excel_attachment_url, excel_attachment_name",
      )
      .in("course_slug", slugs)
      .eq("published", true);

    for (const row of data ?? []) {
      const slug = (row.course_slug as string | null)?.trim();
      if (!slug) {
        continue;
      }

      const current = map.get(slug) ?? [];
      const seen = new Set(current.map((item) => `${item.type}:${item.name}`));

      if (row.attachment_url) {
        const name = ((row.attachment_name as string | null) ?? "PDF ek").trim();
        const key = `pdf:${name}`;
        if (!seen.has(key)) {
          current.push({ name, type: "pdf" });
          seen.add(key);
        }
      }

      if (row.excel_attachment_url) {
        const name = ((row.excel_attachment_name as string | null) ?? "Excel ek").trim();
        const key = `excel:${name}`;
        if (!seen.has(key)) {
          current.push({ name, type: "excel" });
          seen.add(key);
        }
      }

      map.set(slug, current);
    }
  } catch (error) {
    console.error("[featured-course-spotlight] attachment fetch failed:", error);
  }

  return map;
}

function mapSpotlightRow(
  row: Record<string, unknown>,
  context: {
    productBySlug: Map<string, { price_normal: number | null; price_sale: number | null }>;
    stats: Record<string, { lessonCount: number; durationSeconds: number; durationLabel: string }>;
    instructors: Map<number, { full_name: string | null; avatar_url: string | null }>;
    attachmentsBySlug: Map<string, FeaturedCourseSpotlight["attachments"]>;
  },
): FeaturedCourseSpotlight | null {
  const slug = (row.course_slug as string | null)?.trim();
  if (!slug) {
    return null;
  }

  const languageMeta = resolveCourseLanguageMeta(
    row.language as string | null | undefined,
    row.subtitle_language as string | null | undefined,
  );

  const instructorId = Number(row.instructor_wp_user_id ?? 0);
  const instructor = instructorId > 0 ? context.instructors.get(instructorId) : null;
  const courseStats = context.stats[slug];
  const product = context.productBySlug.get(slug);
  const attachments = context.attachmentsBySlug.get(slug) ?? [];
  const pricingModel = row.pricing_model === "paid" ? "paid" : "free";
  const cachePrice = Number(row.price ?? 0);
  const cacheSale =
    row.sale_price == null || row.sale_price === ""
      ? null
      : Number(row.sale_price);

  const priceNormal =
    product?.price_normal ?? (pricingModel === "paid" ? cachePrice : null);
  const priceSale = product?.price_sale ?? cacheSale;
  const isFree =
    pricingModel === "free" ||
    cachePrice <= 0 ||
    (priceSale != null && priceSale <= 0) ||
    (priceNormal != null && priceNormal <= 0);

  return {
    id: String(row.id),
    slug,
    wpCourseId:
      row.wp_course_id == null || row.wp_course_id === ""
        ? null
        : Number(row.wp_course_id),
    title: (row.title as string) || "Kurs",
    subtitle: (row.subtitle as string | null)?.trim() || null,
    summary:
      excerptFromMarkdown(row.description_md as string | null) ||
      (row.subtitle as string | null)?.trim() ||
      "",
    coverImageUrl: (row.cover_image_url as string | null) ?? null,
    category: (row.category as string | null)?.trim() || null,
    level: fromCoursesCacheLevelLabel(row.level as string | null | undefined),
    language: languageMeta.language,
    subtitleLanguage: languageMeta.subtitleLanguage,
    instructorName: instructor?.full_name?.trim() || null,
    instructorAvatar: instructor?.avatar_url ?? null,
    lessonCount: courseStats?.lessonCount ?? 0,
    durationLabel:
      courseStats?.durationLabel ||
      (courseStats?.durationSeconds
        ? formatDuration(courseStats.durationSeconds)
        : ""),
    targetAudience: parseBulletField(row.target_audience as string | null),
    learningOutcomes: parseBulletField(row.what_will_learn as string | null),
    attachments: attachments.slice(0, 6),
    attachmentCount: attachments.length,
    priceNormal: isFree ? null : priceNormal,
    priceSale: isFree ? null : priceSale,
    isFree,
  };
}

export async function getFeaturedCourseSpotlights(
  limit = DEFAULT_LIMIT,
): Promise<FeaturedCourseSpotlight[]> {
  return unstable_cache(
    () => buildFeaturedCourseSpotlights(limit),
    ["featured-course-spotlights-v1", String(limit), process.env.HOMEPAGE_SPOTLIGHT_SLUGS ?? ""],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: ["courses-cache-catalog", "course-stats", "course-products"],
    },
  )();
}
