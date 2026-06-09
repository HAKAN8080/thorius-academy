import { decodeHtmlEntities } from "@/lib/utils/decode-html-entities";
import {
  fetchAllTutorCourses,
  fetchTutorAuthorInfo,
  fetchTutorCourseDetail,
  fetchTutorCourseRating,
  fetchTutorCourseReviews,
  fetchTutorEnrollmentCount,
  mapReviewToRow,
  parseAuthorId,
  parseCourseId,
  resolveCourseImage,
  resolveEnrollmentCount,
  resolveRatingStats,
} from "@/lib/tutor/instructor-api";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { provisionInstructorAcademyAccount } from "@/lib/instructor/provision-academy-account";
import type { SyncInstructorStatsResult } from "@/types/instructor";

export async function syncInstructorStatsFromTutor(): Promise<SyncInstructorStatsResult> {
  const supabase = getSupabaseAdmin();

  try {
    const { courses, source: courseSource } = await fetchAllTutorCourses();
    const instructorIds = new Set<number>();

    for (const course of courses) {
      const authorId = parseAuthorId(course);
      if (authorId > 0) instructorIds.add(authorId);
    }

    const syncedAt = new Date().toISOString();

    for (const instructorId of Array.from(instructorIds)) {
      await supabase.from("instructors").upsert(
        { wp_user_id: instructorId, synced_at: syncedAt },
        { onConflict: "wp_user_id" },
      );
    }

    let instructorsSynced = 0;
    let accountsLinked = 0;
    let accountsCreated = 0;
    let inviteEmailsSent = 0;

    for (const instructorId of Array.from(instructorIds)) {
      const author = await fetchTutorAuthorInfo(instructorId);
      const fullName =
        author?.display_name?.trim() ||
        [author?.first_name, author?.last_name].filter(Boolean).join(" ").trim() ||
        null;
      const email = author?.user_email ?? author?.email ?? null;

      const { error } = await supabase.from("instructors").upsert(
        {
          wp_user_id: instructorId,
          email,
          full_name: fullName,
          avatar_url: author?.avatar_url ?? author?.avatar ?? null,
          synced_at: syncedAt,
        },
        { onConflict: "wp_user_id" },
      );

      if (error) {
        console.error(
          `[Instructor Sync] Instructor upsert failed (${instructorId}):`,
          error.message,
        );
      } else {
        instructorsSynced += 1;
      }

      const provision =
        process.env.INSTRUCTOR_AUTO_PROVISION !== "false"
          ? await provisionInstructorAcademyAccount({
              email,
              fullName,
              wpUserId: instructorId,
            })
          : null;

      if (provision) {
        accountsLinked += 1;
        if (provision.created) accountsCreated += 1;
        if (provision.inviteSent) inviteEmailsSent += 1;
      }
    }

    let reviewsSynced = 0;

    for (const course of courses) {
      const courseId = parseCourseId(course);
      const authorId = parseAuthorId(course);

      const [detail, rating, reviews, enrollmentFallback] = await Promise.all([
        fetchTutorCourseDetail(courseId),
        fetchTutorCourseRating(courseId),
        fetchTutorCourseReviews(courseId),
        fetchTutorEnrollmentCount(courseId),
      ]);

      const { ratingAvg, ratingCount } = resolveRatingStats(rating, detail);
      const enrollmentCount = resolveEnrollmentCount(
        course,
        detail,
        enrollmentFallback,
      );

      const { error: courseError } = await supabase
        .from("instructor_course_stats")
        .upsert(
          {
            wp_course_id: courseId,
            course_slug: course.post_name,
            instructor_wp_user_id: authorId,
            title: decodeHtmlEntities(course.post_title),
            image_url: resolveCourseImage(course) ?? resolveCourseImage(detail ?? course),
            status: course.post_status,
            enrollment_count: enrollmentCount,
            rating_avg: ratingAvg,
            rating_count: ratingCount,
            published_at: course.post_date_gmt ?? course.post_date ?? null,
            synced_at: syncedAt,
          },
          { onConflict: "wp_course_id" },
        );

      if (courseError) {
        console.error(
          `[Instructor Sync] Course upsert failed (${courseId}):`,
          courseError.message,
        );
        continue;
      }

      await supabase.from("courses_cache").upsert(
        {
          wp_course_id: courseId,
          instructor_wp_user_id: authorId,
          course_slug: course.post_name,
          title: decodeHtmlEntities(course.post_title),
          cover_image_url:
            resolveCourseImage(course) ?? resolveCourseImage(detail ?? course),
          published: course.post_status === "publish",
          updated_at: syncedAt,
        },
        { onConflict: "wp_course_id" },
      );

      const reviewRows = reviews
        .map((review) => mapReviewToRow(review, courseId))
        .filter((row): row is NonNullable<typeof row> => row !== null)
        .map((row) => ({ ...row, synced_at: syncedAt }));

      if (reviewRows.length > 0) {
        const { error: reviewError } = await supabase
          .from("instructor_course_reviews")
          .upsert(reviewRows, { onConflict: "wp_review_id" });

        if (reviewError) {
          console.error(
            `[Instructor Sync] Review upsert failed (${courseId}):`,
            reviewError.message,
          );
        } else {
          reviewsSynced += reviewRows.length;
        }
      }
    }

    return {
      success: true,
      coursesSynced: courses.length,
      reviewsSynced,
      instructorsSynced,
      accountsLinked,
      accountsCreated,
      inviteEmailsSent,
      courseSource,
      warning:
        courses.length === 0
          ? "Hiç kurs bulunamadı. Tutor API anahtarlarını ve thorius.com.tr erişimini kontrol edin."
          : undefined,
    };
  } catch (err) {
    console.error("[Instructor Sync] Exception:", err);
    return { success: false, error: (err as Error).message };
  }
}
