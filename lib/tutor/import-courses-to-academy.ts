import {
  buildCoursesCacheDraftPayload,
  buildCoursesCacheSlugFields,
} from "@/lib/instructor/courses-cache-write";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  extractVideoUrl,
  fetchCourseFullStructureFresh,
} from "@/lib/tutor/api";
import {
  fetchAllTutorCourses,
  fetchWpCourseMetaById,
  fetchWpCoursePrimaryCategoryName,
  parseAuthorId,
  parseCourseId,
  resolveCourseImage,
} from "@/lib/tutor/instructor-api";
import { decodeHtmlEntities } from "@/lib/utils/decode-html-entities";

export interface ImportTutorCourseResult {
  wpCourseId: number;
  courseCacheId?: string;
  courseSlug?: string;
  title?: string;
  sectionsUpserted: number;
  lessonsUpserted: number;
  skipped?: boolean;
  skipReason?: string;
  dryRun?: boolean;
  error?: string;
}

export interface ImportTutorCourseOptions {
  wpCourseId: number;
  dryRun?: boolean;
  skipIfHasLessons?: boolean;
}

export interface ImportAllTutorCoursesOptions {
  wpCourseIds?: number[];
  limit?: number;
  dryRun?: boolean;
  skipIfHasLessons?: boolean;
  syncCatalogFirst?: boolean;
}

export interface ImportAllTutorCoursesResult {
  dryRun: boolean;
  catalogSynced?: boolean;
  total: number;
  imported: number;
  skipped: number;
  failed: number;
  results: ImportTutorCourseResult[];
}

function getDefaultInstructorWpId(): number {
  const parsed = parseInt(process.env.DEFAULT_INSTRUCTOR_WP_ID ?? "277", 10);
  return Number.isNaN(parsed) ? 277 : parsed;
}

async function ensureInstructor(wpUserId: number): Promise<void> {
  const admin = getSupabaseAdmin();
  await admin.from("instructors").upsert(
    {
      wp_user_id: wpUserId,
      synced_at: new Date().toISOString(),
    },
    { onConflict: "wp_user_id" },
  );
}

async function resolveCourseMeta(wpCourseId: number) {
  const admin = getSupabaseAdmin();
  const category = await fetchWpCoursePrimaryCategoryName(wpCourseId);

  const { data: stats } = await admin
    .from("instructor_course_stats")
    .select(
      "wp_course_id, course_slug, instructor_wp_user_id, title, image_url, status",
    )
    .eq("wp_course_id", wpCourseId)
    .maybeSingle();

  if (stats) {
    return {
      wpCourseId,
      slug: stats.course_slug as string,
      title: stats.title as string,
      instructorWpUserId: Number(stats.instructor_wp_user_id),
      coverImageUrl: (stats.image_url as string | null) ?? null,
      published: stats.status === "publish",
      category,
    };
  }

  const { courses } = await fetchAllTutorCourses();
  const course = courses.find((row) => parseCourseId(row) === wpCourseId);
  if (course) {
    const authorId = parseAuthorId(course);
    return {
      wpCourseId,
      slug: course.post_name,
      title: decodeHtmlEntities(course.post_title),
      instructorWpUserId: authorId > 0 ? authorId : getDefaultInstructorWpId(),
      coverImageUrl: resolveCourseImage(course),
      published: course.post_status === "publish",
      category,
    };
  }

  const wpCourse = await fetchWpCourseMetaById(wpCourseId);
  if (!wpCourse) {
    return null;
  }

  return {
    wpCourseId,
    slug: wpCourse.slug,
    title: decodeHtmlEntities(wpCourse.title),
    instructorWpUserId:
      wpCourse.instructorWpUserId > 0
        ? wpCourse.instructorWpUserId
        : getDefaultInstructorWpId(),
    coverImageUrl: null,
    published: wpCourse.published,
    category,
  };
}

async function ensureCourseCache(
  wpCourseId: number,
  dryRun: boolean,
): Promise<{ id: string; slug: string; title: string } | null> {
  const admin = getSupabaseAdmin();
  const meta = await resolveCourseMeta(wpCourseId);

  if (!meta) {
    return null;
  }

  const { data: existing } = await admin
    .from("courses_cache")
    .select("id, course_slug, title, category")
    .eq("wp_course_id", wpCourseId)
    .maybeSingle();

  if (dryRun) {
    return {
      id: existing ? String(existing.id) : "dry-run",
      slug: (existing?.course_slug as string) || meta.slug,
      title: (existing?.title as string) || meta.title,
    };
  }

  await ensureInstructor(meta.instructorWpUserId);

  const { data, error } = await admin
    .from("courses_cache")
    .upsert(
      buildCoursesCacheDraftPayload(
        {
          wp_course_id: wpCourseId,
          instructor_wp_user_id: meta.instructorWpUserId,
          title: meta.title,
          cover_image_url: meta.coverImageUrl,
          category: meta.category,
          published: meta.published,
          updated_at: new Date().toISOString(),
        },
        meta.slug,
      ),
      { onConflict: "wp_course_id" },
    )
    .select("id, course_slug, title, category")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "courses_cache oluşturulamadı");
  }

  return {
    id: String(data.id),
    slug: (data.course_slug as string) || meta.slug,
    title: (data.title as string) || meta.title,
  };
}

async function courseHasImportedLessons(
  wpCourseId: number,
): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { count } = await admin
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("course_id", wpCourseId)
    .eq("published", true);

  return (count ?? 0) > 0;
}

export async function importTutorCourseToAcademy(
  options: ImportTutorCourseOptions,
): Promise<ImportTutorCourseResult> {
  const { wpCourseId, dryRun = false, skipIfHasLessons = false } = options;

  try {
    if (skipIfHasLessons && (await courseHasImportedLessons(wpCourseId))) {
      return {
        wpCourseId,
        sectionsUpserted: 0,
        lessonsUpserted: 0,
        skipped: true,
        skipReason: "published lessons already exist",
      };
    }

    const cache = await ensureCourseCache(wpCourseId, dryRun);
    if (!cache) {
      return {
        wpCourseId,
        sectionsUpserted: 0,
        lessonsUpserted: 0,
        error: "Kurs Tutor/WP katalogunda bulunamadı",
      };
    }

    const topics = await fetchCourseFullStructureFresh(wpCourseId);
    if (topics.length === 0) {
      return {
        wpCourseId,
        courseCacheId: cache.id,
        courseSlug: cache.slug,
        title: cache.title,
        sectionsUpserted: 0,
        lessonsUpserted: 0,
        skipped: true,
        skipReason: "Tutor müfredatı boş",
        dryRun,
      };
    }

    if (dryRun) {
      const lessonCount = topics.reduce(
        (sum, topic) => sum + topic.lessons.length,
        0,
      );
      return {
        wpCourseId,
        courseCacheId: cache.id,
        courseSlug: cache.slug,
        title: cache.title,
        sectionsUpserted: topics.length,
        lessonsUpserted: lessonCount,
        dryRun: true,
      };
    }

    const admin = getSupabaseAdmin();
    const slugFields = buildCoursesCacheSlugFields(cache.slug);

    const { data: existingSections } = await admin
      .from("sections")
      .select("id, sort_order, title")
      .eq("course_id", cache.id)
      .order("sort_order", { ascending: true });

    const sectionIdByOrder = new Map<number, string>();
    for (const section of existingSections ?? []) {
      sectionIdByOrder.set(Number(section.sort_order), String(section.id));
    }

    let sectionsUpserted = 0;
    const sectionIdByTopicOrder = new Map<number, string>();

    for (const topic of topics) {
      const sortOrder = topic.topic_order;
      const title = decodeHtmlEntities(topic.topic_title) || "Bölüm";
      const existingId = sectionIdByOrder.get(sortOrder);

      if (existingId) {
        await admin
          .from("sections")
          .update({ title, published: true })
          .eq("id", existingId);
        sectionIdByTopicOrder.set(sortOrder, existingId);
        sectionsUpserted += 1;
        continue;
      }

      const { data: inserted, error: sectionError } = await admin
        .from("sections")
        .insert({
          course_id: cache.id,
          title,
          sort_order: sortOrder,
          published: true,
        })
        .select("id")
        .single();

      if (sectionError || !inserted) {
        throw new Error(sectionError?.message ?? "Bölüm oluşturulamadı");
      }

      sectionIdByTopicOrder.set(sortOrder, String(inserted.id));
      sectionsUpserted += 1;
    }

    let lessonOrder = 1;
    const lessonsToUpsert = [];

    for (const topic of topics) {
      const sectionId = sectionIdByTopicOrder.get(topic.topic_order) ?? null;

      for (const lesson of topic.lessons) {
        const videoInfo = extractVideoUrl(lesson.video);
        const hasVideo = Boolean(videoInfo.url);
        const durationSeconds = videoInfo.duration || null;

        lessonsToUpsert.push({
          course_id: wpCourseId,
          courses_cache_id: cache.id,
          section_id: sectionId,
          course_slug: slugFields.course_slug,
          wp_lesson_id: lesson.ID,
          lesson_order: lessonOrder++,
          title: decodeHtmlEntities(lesson.post_title),
          description: lesson.post_content || null,
          duration_seconds: durationSeconds,
          duration_minutes:
            durationSeconds != null
              ? Math.max(1, Math.round(durationSeconds / 60))
              : null,
          video_type: videoInfo.type,
          video_url: videoInfo.url,
          video_embed_url: videoInfo.embedUrl,
          topic_title: decodeHtmlEntities(topic.topic_title),
          topic_order: topic.topic_order,
          type: hasVideo ? "video" : "text",
          content_md: hasVideo ? null : lesson.post_content || null,
          is_free: false,
          published: true,
        });
      }
    }

    if (lessonsToUpsert.length === 0) {
      return {
        wpCourseId,
        courseCacheId: cache.id,
        courseSlug: cache.slug,
        title: cache.title,
        sectionsUpserted,
        lessonsUpserted: 0,
        skipped: true,
        skipReason: "Tutor dersi yok",
      };
    }

    const { error: lessonError } = await admin
      .from("lessons")
      .upsert(lessonsToUpsert, { onConflict: "wp_lesson_id" });

    if (lessonError) {
      throw new Error(lessonError.message);
    }

    await admin
      .from("courses_cache")
      .update({
        ...slugFields,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cache.id);

    return {
      wpCourseId,
      courseCacheId: cache.id,
      courseSlug: cache.slug,
      title: cache.title,
      sectionsUpserted,
      lessonsUpserted: lessonsToUpsert.length,
    };
  } catch (error) {
    return {
      wpCourseId,
      sectionsUpserted: 0,
      lessonsUpserted: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function importAllTutorCoursesToAcademy(
  options: ImportAllTutorCoursesOptions = {},
): Promise<ImportAllTutorCoursesResult> {
  const {
    wpCourseIds,
    limit,
    dryRun = false,
    skipIfHasLessons = true,
    syncCatalogFirst = true,
  } = options;

  let catalogSynced: boolean | undefined;

  if (syncCatalogFirst && !dryRun) {
    const { syncInstructorStatsFromTutor } = await import(
      "@/lib/instructor/sync-from-tutor"
    );
    const syncResult = await syncInstructorStatsFromTutor();
    catalogSynced = syncResult.success;
    if (!syncResult.success) {
      console.warn(
        "[Import Tutor] Catalog sync failed:",
        syncResult.error ?? "unknown",
      );
    }
  }

  let targets: number[] = wpCourseIds ?? [];

  if (targets.length === 0) {
    const { courses, source, wpCoursesFetched, tutorCoursesFetched } =
      await fetchAllTutorCourses();
    console.log(
      `[Import Tutor] Katalog: ${courses.length} kurs (kaynak=${source}, wp=${wpCoursesFetched}, tutor=${tutorCoursesFetched})`,
    );
    targets = courses
      .map((course) => parseCourseId(course))
      .filter((id) => id > 0);
  }

  targets = Array.from(new Set(targets)).sort((a, b) => a - b);
  if (typeof limit === "number" && limit > 0) {
    targets = targets.slice(0, limit);
  }

  const results: ImportTutorCourseResult[] = [];
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const wpCourseId of targets) {
    const result = await importTutorCourseToAcademy({
      wpCourseId,
      dryRun,
      skipIfHasLessons,
    });
    results.push(result);

    if (result.error) {
      failed += 1;
    } else if (result.skipped) {
      skipped += 1;
    } else {
      imported += 1;
    }
  }

  return {
    dryRun,
    catalogSynced,
    total: targets.length,
    imported,
    skipped,
    failed,
    results,
  };
}
