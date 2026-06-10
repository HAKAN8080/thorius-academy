"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireCurriculumAccess } from "@/lib/instructor/curriculum-access";
import {
  buildCoursesCacheSlugFields,
  buildCoursesCacheDraftPayload,
  normalizeCourseCacheId,
  normalizeCoursesCacheRow,
  requireCourseCacheAccess,
  verifyCourseCacheAccess,
} from "@/lib/instructor/course-cache-access";
import { slugifyCourseTitle } from "@/lib/instructor/slugify-course-title";
import { normalizeCoursesCacheWritePayload } from "@/lib/instructor/courses-cache-write";
import {
  formatPublishReadinessError,
  getCoursePublishReadiness,
} from "@/lib/instructor/course-publish-readiness";
import { ensureCoursesCacheForInstructor } from "@/lib/instructor/sync-courses-cache";
import { syncCourseToWp } from "@/lib/wordpress/sync-course-to-wp";
import type {
  CourseAdditionalInput,
  CourseBasicsInput,
  CoursesCache,
  InstructorCourseListItem,
  InstructorDashboardStats,
} from "@/types/instructor-course";

function mapCourse(row: Record<string, unknown>): CoursesCache {
  return normalizeCoursesCacheRow(row);
}

async function nextSyntheticWpCourseId(): Promise<number> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("courses_cache")
    .select("wp_course_id")
    .not("wp_course_id", "is", null)
    .lt("wp_course_id", 0)
    .order("wp_course_id", { ascending: true })
    .limit(1);

  let candidate =
    typeof data?.[0]?.wp_course_id === "number"
      ? data[0].wp_course_id - 1
      : -1000;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data: existing } = await admin
      .from("courses_cache")
      .select("id")
      .eq("wp_course_id", candidate)
      .maybeSingle();

    if (!existing) {
      return candidate;
    }

    candidate -= 1;
  }

  return candidate;
}

async function replaceSyntheticWpCourseId(
  courseCacheId: string,
  oldWpCourseId: number,
  newWpCourseId: number,
  stats: {
    slug: string;
    title: string;
    published: boolean;
    coverImageUrl: string | null;
    instructorWpUserId: number;
  },
): Promise<void> {
  const admin = getSupabaseAdmin();

  const { data: oldStats } = await admin
    .from("instructor_course_stats")
    .select("enrollment_count, rating_avg, rating_count, published_at")
    .eq("wp_course_id", oldWpCourseId)
    .maybeSingle();

  await admin
    .from("lessons")
    .update({ course_id: newWpCourseId })
    .eq("course_id", oldWpCourseId);

  await admin
    .from("instructor_course_stats")
    .delete()
    .eq("wp_course_id", oldWpCourseId);

  const { error: statsError } = await admin.from("instructor_course_stats").upsert(
    {
      wp_course_id: newWpCourseId,
      course_slug: stats.slug,
      instructor_wp_user_id: stats.instructorWpUserId,
      title: stats.title,
      image_url: stats.coverImageUrl,
      status: stats.published ? "publish" : "draft",
      enrollment_count: Number(oldStats?.enrollment_count ?? 0),
      rating_avg: Number(oldStats?.rating_avg ?? 0),
      rating_count: Number(oldStats?.rating_count ?? 0),
      published_at: stats.published
        ? (oldStats?.published_at as string | null) ?? new Date().toISOString()
        : null,
    },
    { onConflict: "wp_course_id" },
  );

  if (statsError) {
    throw new Error(`Kurs istatistiği güncellenemedi: ${statsError.message}`);
  }

  await admin
    .from("courses_cache")
    .update({
      wp_course_id: newWpCourseId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", courseCacheId);
}

export async function getInstructorDashboardStats(): Promise<InstructorDashboardStats> {
  const access = await requireCurriculumAccess();
  if (!access.wpInstructorId && !access.isAdmin) {
    return {
      totalCourses: 0,
      activeCourses: 0,
      totalStudents: 0,
      totalEarnings: 0,
    };
  }

  const admin = getSupabaseAdmin();

  if (access.wpInstructorId) {
    await ensureCoursesCacheForInstructor(access.wpInstructorId);
  }

  let totalCourses = 0;
  let activeCourses = 0;
  let totalStudents = 0;

  if (access.wpInstructorId) {
    const { data: statRows } = await admin
      .from("instructor_course_stats")
      .select("status, enrollment_count")
      .eq("instructor_wp_user_id", access.wpInstructorId);

    const rows = statRows ?? [];
    totalCourses = rows.length;
    activeCourses = rows.filter((row) => row.status === "publish").length;
    totalStudents = rows.reduce(
      (sum, row) => sum + Number(row.enrollment_count ?? 0),
      0,
    );
  } else if (access.isAdmin) {
    const { data: courses } = await admin.from("courses_cache").select("id, published");
    const courseRows = courses ?? [];
    totalCourses = courseRows.length;
    activeCourses = courseRows.filter((c) => c.published).length;
  }

  let coursesQuery = admin.from("courses_cache").select("id, published");
  if (!access.isAdmin && access.wpInstructorId) {
    coursesQuery = coursesQuery.eq("instructor_wp_user_id", access.wpInstructorId);
  }

  const { data: courses } = await coursesQuery;
  const courseRows = courses ?? [];

  if (totalCourses === 0) {
    totalCourses = courseRows.length;
    activeCourses = courseRows.filter((c) => c.published).length;
  }

  const wpCourseIds = courseRows
    .map((c) => (c as { wp_course_id?: number }).wp_course_id)
    .filter((id): id is number => typeof id === "number");

  if (totalStudents === 0 && wpCourseIds.length > 0) {
    const { data: stats } = await admin
      .from("instructor_course_stats")
      .select("enrollment_count")
      .in("wp_course_id", wpCourseIds);
    totalStudents = (stats ?? []).reduce(
      (sum, row) => sum + ((row.enrollment_count as number) ?? 0),
      0,
    );
  }

  let earningsQuery = admin
    .from("earnings")
    .select("instructor_share");
  if (!access.isAdmin && access.wpInstructorId) {
    earningsQuery = earningsQuery.eq(
      "instructor_wp_user_id",
      access.wpInstructorId,
    );
  }

  const { data: earnings } = await earningsQuery;
  const totalEarnings = (earnings ?? []).reduce(
    (sum, row) => sum + Number(row.instructor_share ?? 0),
    0,
  );

  return {
    totalCourses,
    activeCourses,
    totalStudents,
    totalEarnings,
  };
}

export async function getInstructorCourseList(): Promise<
  InstructorCourseListItem[]
> {
  const access = await requireCurriculumAccess();
  const admin = getSupabaseAdmin();

  if (!access.wpInstructorId && !access.isAdmin) {
    return [];
  }

  if (access.wpInstructorId) {
    await ensureCoursesCacheForInstructor(access.wpInstructorId);
  }

  let statsQuery = admin
    .from("instructor_course_stats")
    .select("*")
    .order("published_at", { ascending: false });

  if (!access.isAdmin && access.wpInstructorId) {
    statsQuery = statsQuery.eq("instructor_wp_user_id", access.wpInstructorId);
  }

  const { data: statsRows, error: statsError } = await statsQuery;

  if (statsError || !statsRows?.length) {
    return [];
  }

  const wpIds = statsRows
    .map((row) => row.wp_course_id as number)
    .filter((id) => typeof id === "number");

  const { data: cacheRows } = await admin
    .from("courses_cache")
    .select("id, wp_course_id")
    .in("wp_course_id", wpIds);

  const cacheIdByWp = new Map<number, string>();
  for (const row of cacheRows ?? []) {
    cacheIdByWp.set(row.wp_course_id as number, String(row.id));
  }

  let earningsQuery = admin
    .from("earnings")
    .select("course_id, instructor_share");
  if (!access.isAdmin && access.wpInstructorId) {
    earningsQuery = earningsQuery.eq(
      "instructor_wp_user_id",
      access.wpInstructorId,
    );
  }
  const { data: earningsRows } = await earningsQuery;
  const earningsMap = new Map<string, number>();
  for (const row of earningsRows ?? []) {
    const courseId = row.course_id != null ? String(row.course_id) : null;
    if (!courseId) continue;
    earningsMap.set(
      courseId,
      (earningsMap.get(courseId) ?? 0) + Number(row.instructor_share ?? 0),
    );
  }

  return statsRows.map((row) => {
    const wpCourseId = row.wp_course_id as number;
    const cacheId = cacheIdByWp.get(wpCourseId);

    return {
      id: cacheId ?? String(wpCourseId),
      wp_course_id: wpCourseId,
      title: row.title as string,
      cover_image_url: row.image_url as string | null,
      enrollment_count: Number(row.enrollment_count ?? 0),
      earnings_total: cacheId ? (earningsMap.get(cacheId) ?? 0) : 0,
      published: row.status === "publish",
      course_slug: row.course_slug as string,
      status: row.status as string,
      published_at: row.published_at as string | null,
      rating_avg: Number(row.rating_avg ?? 0),
      rating_count: Number(row.rating_count ?? 0),
    };
  });
}

export async function createInstructorCourse(): Promise<{ id: string }> {
  const access = await requireCurriculumAccess();
  if (!access.wpInstructorId) {
    throw new Error("Eğitmen hesabı bağlanamadı. Çıkış yapıp tekrar giriş deneyin.");
  }

  const admin = getSupabaseAdmin();

  const { error: instructorError } = await admin.from("instructors").upsert(
    {
      wp_user_id: access.wpInstructorId,
      synced_at: new Date().toISOString(),
    },
    { onConflict: "wp_user_id" },
  );

  if (instructorError) {
    throw new Error(
      `Eğitmen kaydı güncellenemedi: ${instructorError.message}`,
    );
  }

  const wpCourseId = await nextSyntheticWpCourseId();
  const slug = `yeni-kurs-${Math.abs(wpCourseId)}`;

  const { data, error } = await admin
    .from("courses_cache")
    .insert(
      buildCoursesCacheDraftPayload(
        {
          wp_course_id: wpCourseId,
          instructor_wp_user_id: access.wpInstructorId,
          title: "Yeni Kurs",
          published: false,
        },
        slug,
      ),
    )
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Kurs oluşturulamadı.");
  }

  const courseCacheId = normalizeCourseCacheId(
    data.id as string | number | bigint,
  );

  const { error: statsError } = await admin.from("instructor_course_stats").upsert(
    {
      wp_course_id: wpCourseId,
      course_slug: slug,
      instructor_wp_user_id: access.wpInstructorId,
      title: "Yeni Kurs",
      status: "draft",
      enrollment_count: 0,
      rating_avg: 0,
      rating_count: 0,
    },
    { onConflict: "wp_course_id" },
  );

  if (statsError) {
    throw new Error(`Kurs istatistiği oluşturulamadı: ${statsError.message}`);
  }

  revalidatePath("/instructor/dashboard");
  revalidatePath("/instructor/courses");
  revalidatePath(`/instructor/courses/${courseCacheId}/basics`);
  return { id: courseCacheId };
}

export async function createInstructorCourseAndRedirect() {
  const { id } = await createInstructorCourse();
  redirect(`/instructor/courses/${id}/basics`);
}

export async function getCourseBasics(
  courseCacheId: string,
): Promise<CoursesCache | { error: string }> {
  try {
    return await requireCourseCacheAccess(courseCacheId);
  } catch {
    return { error: "Kurs bulunamadı veya erişim yok." };
  }
}

export async function saveCourseBasics(
  courseCacheId: string,
  input: CourseBasicsInput,
): Promise<{ course: CoursesCache } | { error: string }> {
  try {
    const existing = await requireCourseCacheAccess(courseCacheId);
    const admin = getSupabaseAdmin();
    const slug =
      input.course_slug?.trim() ||
      existing.course_slug ||
      slugifyCourseTitle(input.title) ||
      `kurs-${Math.abs(existing.wp_course_id ?? 0)}`;

    const published = input.published;
    if (published) {
      const readiness = await getCoursePublishReadiness(
        courseCacheId,
        { ...input, course_slug: slug },
        existing.course_slug,
      );
      if (!readiness.ready) {
        return { error: formatPublishReadinessError(readiness.missing) };
      }
    }

    const existingWpCourseId = existing.wp_course_id;
    const shouldSyncToWp =
      published ||
      (typeof existingWpCourseId === "number" && existingWpCourseId > 0);

    let resolvedWpCourseId = existingWpCourseId;
    let resolvedSlug = slug;

    if (shouldSyncToWp) {
      const syncResult = await syncCourseToWp({
        academyCourseId: courseCacheId,
        title: input.title.trim(),
        slug,
        description: input.description_md,
        coverImageUrl: input.cover_image_url,
        category: input.category,
        price: input.pricing_model === "paid" ? (input.price ?? 0) : 0,
        salePrice: input.sale_price,
        instructorWpUserId: existing.instructor_wp_user_id,
        published,
        wpCourseId:
          typeof existingWpCourseId === "number" && existingWpCourseId > 0
            ? existingWpCourseId
            : null,
      });

      if (!syncResult.success) {
        if (published) {
          const detail = syncResult.error?.trim();
          return {
            error: detail
              ? `Kurs yayına alınamadı: ${detail}`
              : "Kurs yayına alınamadı: WordPress senkronizasyonu başarısız.",
          };
        }
        console.warn("[saveCourseBasics] WP sync skipped or failed:", syncResult.error);
      } else if (typeof syncResult.wpCourseId === "number") {
        if (
          typeof existingWpCourseId === "number" &&
          existingWpCourseId < 0 &&
          syncResult.wpCourseId > 0
        ) {
          await replaceSyntheticWpCourseId(
            courseCacheId,
            existingWpCourseId,
            syncResult.wpCourseId,
            {
              slug: syncResult.slug ?? slug,
              title: input.title.trim(),
              published,
              coverImageUrl: input.cover_image_url?.trim() || null,
              instructorWpUserId: existing.instructor_wp_user_id,
            },
          );
        }

        resolvedWpCourseId = syncResult.wpCourseId;
        if (syncResult.slug) {
          resolvedSlug = syncResult.slug;
        }
      }
    }

    const cacheUpdatePayload = normalizeCoursesCacheWritePayload({
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || null,
      description_md: input.description_md ?? null,
      cover_image_url: input.cover_image_url?.trim() || null,
      intro_video_url: input.intro_video_url?.trim() || null,
      pricing_model: input.pricing_model,
      price: input.pricing_model === "paid" ? (input.price ?? 0) : 0,
      sale_price: input.sale_price ?? null,
      level: input.level ?? "Başlangıç",
      language: input.language ?? "Türkçe",
      category: input.category?.trim() || null,
      visibility: input.visibility,
      published,
      ...buildCoursesCacheSlugFields(resolvedSlug),
      updated_at: new Date().toISOString(),
    });

    if (
      typeof resolvedWpCourseId === "number" &&
      resolvedWpCourseId > 0 &&
      resolvedWpCourseId !== existingWpCourseId
    ) {
      cacheUpdatePayload.wp_course_id = resolvedWpCourseId;
    }

    const { data, error } = await admin
      .from("courses_cache")
      .update(cacheUpdatePayload)
      .eq("id", courseCacheId)
      .select("*")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Kaydedilemedi" };
    }

    const statsWpCourseId =
      typeof resolvedWpCourseId === "number" && resolvedWpCourseId > 0
        ? resolvedWpCourseId
        : existingWpCourseId;

    if (statsWpCourseId) {
      await admin
        .from("instructor_course_stats")
        .update({
          title: input.title.trim(),
          course_slug: resolvedSlug,
          image_url: input.cover_image_url?.trim() || null,
          status: published ? "publish" : "draft",
        })
        .eq("wp_course_id", statsWpCourseId);
    }

    revalidatePath(`/instructor/courses/${courseCacheId}/basics`);
    return { course: mapCourse(data as Record<string, unknown>) };
  } catch {
    return { error: "Kaydedilemedi" };
  }
}

export async function saveCourseAdditional(
  courseCacheId: string,
  input: CourseAdditionalInput,
): Promise<{ success: true } | { error: string }> {
  try {
    await requireCourseCacheAccess(courseCacheId);
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("courses_cache")
      .update({
        what_will_learn: input.what_will_learn ?? null,
        target_audience: input.target_audience ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseCacheId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/instructor/courses/${courseCacheId}/additional`);
    return { success: true };
  } catch {
    return { error: "Kaydedilemedi" };
  }
}

export async function getCourseForBuilder(courseCacheId: string) {
  return verifyCourseCacheAccess(courseCacheId);
}
