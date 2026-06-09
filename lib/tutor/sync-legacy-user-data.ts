import { fetchLegacyUserDataFromWp } from "@/lib/tutor/fetch-legacy-user-data";
import type { TutorLegacyEnrollment } from "@/lib/tutor/legacy-user-data";
import { syncLessonsFromTutor } from "@/lib/lessons/sync-from-tutor";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchCourseBySlug } from "@/lib/wordpress/api";
import type { Database } from "@/types/database";

type EnrollmentInsert = Database["public"]["Tables"]["enrollments"]["Insert"];
type LessonRow = Pick<
  Database["public"]["Tables"]["lessons"]["Row"],
  "id" | "wp_lesson_id"
>;

const LEGACY_SYNC_STALE_MS = 6 * 60 * 60 * 1000;

export interface SyncLegacyUserDataResult {
  skipped: boolean;
  reason?: string;
  importedEnrollments: number;
  updatedProgress: number;
}

function shouldRunLegacySync(
  enrollmentsCount: number,
  lastSyncedAt: string | undefined,
): boolean {
  if (enrollmentsCount === 0) {
    return true;
  }

  if (!lastSyncedAt) {
    return true;
  }

  const lastSyncMs = Date.parse(lastSyncedAt);
  if (!Number.isFinite(lastSyncMs)) {
    return true;
  }

  return Date.now() - lastSyncMs > LEGACY_SYNC_STALE_MS;
}

async function upsertLegacyEnrollment(
  userId: string,
  legacy: TutorLegacyEnrollment,
): Promise<string | null> {
  const admin = getSupabaseAdmin();

  const { data: existing } = await admin
    .from("enrollments")
    .select("id, progress, source")
    .eq("user_id", userId)
    .eq("course_slug", legacy.course_slug)
    .neq("status", "cancelled")
    .maybeSingle();

  if (existing?.id) {
    const shouldUpdateProgress =
      legacy.progress_percent > (existing.progress ?? 0);
    if (shouldUpdateProgress) {
      await admin
        .from("enrollments")
        .update({
          progress: legacy.progress_percent,
          last_lesson_id: legacy.last_lesson_id,
          status: legacy.course_completed ? "completed" : "active",
          completed_at: legacy.course_completed ? new Date().toISOString() : null,
        })
        .eq("id", existing.id);
    }
    return existing.id;
  }

  const course = await fetchCourseBySlug(legacy.course_slug);
  const payload: EnrollmentInsert = {
    user_id: userId,
    course_id: legacy.course_id,
    course_slug: legacy.course_slug,
    course_title: course?.title ?? legacy.course_title,
    course_image: course?.featuredImage ?? null,
    course_category: course?.categories[0]?.name ?? null,
    instructor_name: course?.instructor?.name ?? null,
    enrolled_at: legacy.enrolled_at ?? new Date().toISOString(),
    progress: legacy.progress_percent,
    completed_at: legacy.course_completed ? new Date().toISOString() : null,
    last_lesson_id: legacy.last_lesson_id,
    status: legacy.course_completed ? "completed" : "active",
    source: "tutor_legacy",
  };

  const { data, error } = await admin
    .from("enrollments")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error(
      `[Legacy Sync] Enrollment insert failed (${legacy.course_slug}):`,
      error.message,
    );
    return null;
  }

  return data.id;
}

async function importLessonProgress(
  userId: string,
  legacy: TutorLegacyEnrollment,
): Promise<number> {
  if (legacy.completed_lesson_ids.length === 0) {
    return 0;
  }

  const admin = getSupabaseAdmin();
  await syncLessonsFromTutor(admin, legacy.course_id, legacy.course_slug);

  const { data: lessons, error: lessonsError } = await admin
    .from("lessons")
    .select("id, wp_lesson_id")
    .eq("course_id", legacy.course_id);

  if (lessonsError || !lessons?.length) {
    return 0;
  }

  const lessonMap = new Map(
    (lessons as LessonRow[]).map((lesson) => [lesson.wp_lesson_id, lesson.id]),
  );

  let imported = 0;
  const now = new Date().toISOString();

  for (const wpLessonId of legacy.completed_lesson_ids) {
    const lessonId = lessonMap.get(wpLessonId);
    if (!lessonId) continue;

    const { data: existing } = await admin
      .from("lesson_progress")
      .select("completed")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (existing?.completed) {
      continue;
    }

    const { error } = await admin.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        course_id: legacy.course_id,
        watched_seconds: 0,
        completed: true,
        completed_at: now,
        last_watched_at: now,
      },
      { onConflict: "user_id,lesson_id" },
    );

    if (!error) {
      imported += 1;
    }
  }

  return imported;
}

export async function syncLegacyUserData(
  userId: string,
  email: string,
): Promise<SyncLegacyUserDataResult> {
  const admin = getSupabaseAdmin();

  const { count: enrollmentsCount, error: countError } = await admin
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .neq("status", "cancelled");

  if (countError) {
    console.warn("[Legacy Sync] Enrollment count failed:", countError.message);
  }

  const { data: authUser, error: authError } =
    await admin.auth.admin.getUserById(userId);

  if (authError || !authUser.user) {
    return {
      skipped: true,
      reason: "user_not_found",
      importedEnrollments: 0,
      updatedProgress: 0,
    };
  }

  const lastSyncedAt =
    typeof authUser.user.user_metadata?.tutor_legacy_synced_at === "string"
      ? authUser.user.user_metadata.tutor_legacy_synced_at
      : undefined;

  if (!shouldRunLegacySync(enrollmentsCount ?? 0, lastSyncedAt)) {
    return {
      skipped: true,
      reason: "recently_synced",
      importedEnrollments: 0,
      updatedProgress: 0,
    };
  }

  const legacyData = await fetchLegacyUserDataFromWp(email);
  if (!legacyData?.found || legacyData.enrollments.length === 0) {
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...authUser.user.user_metadata,
        tutor_legacy_synced_at: new Date().toISOString(),
      },
    });

    return {
      skipped: true,
      reason: "no_wp_enrollments",
      importedEnrollments: 0,
      updatedProgress: 0,
    };
  }

  let importedEnrollments = 0;
  let updatedProgress = 0;

  for (const legacyEnrollment of legacyData.enrollments) {
    if (!legacyEnrollment.course_slug || legacyEnrollment.course_id <= 0) {
      continue;
    }

    const { data: existingEnrollment } = await admin
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_slug", legacyEnrollment.course_slug)
      .neq("status", "cancelled")
      .maybeSingle();

    const enrollmentId = await upsertLegacyEnrollment(userId, legacyEnrollment);
    if (!enrollmentId) continue;

    if (!existingEnrollment?.id) {
      importedEnrollments += 1;
    }

    updatedProgress += await importLessonProgress(userId, legacyEnrollment);
  }

  await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...authUser.user.user_metadata,
      tutor_legacy_synced_at: new Date().toISOString(),
      wp_user_id: legacyData.wp_user_id ?? authUser.user.user_metadata?.wp_user_id,
    },
  });

  console.log(
    `[Legacy Sync] user=${userId} enrollments=${importedEnrollments} progress=${updatedProgress}`,
  );

  return {
    skipped: false,
    importedEnrollments,
    updatedProgress,
  };
}
