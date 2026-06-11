import { requireCourseCacheAccess } from "@/lib/instructor/course-cache-access";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CoursesCache } from "@/types/instructor-course";

export interface CourseStudentRow {
  enrollment_id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  enrolled_at: string;
  progress: number;
  status: string;
  source: string | null;
  completed_at: string | null;
}

export interface CourseStudentsResult {
  course: CoursesCache;
  students: CourseStudentRow[];
}

function formatEnrollmentSource(source: string | null): string | null {
  if (!source) return null;
  if (source === "wc_purchase") return "Satın alma";
  if (source === "tutor_legacy") return "Legacy kayıt";
  return source;
}

async function loadEmailsByUserIds(
  userIds: string[],
): Promise<Map<string, string>> {
  const admin = getSupabaseAdmin();
  const emailByUserId = new Map<string, string>();

  await Promise.all(
    userIds.map(async (userId) => {
      const { data, error } = await admin.auth.admin.getUserById(userId);
      if (error || !data.user?.email) return;
      emailByUserId.set(userId, data.user.email.trim().toLowerCase());
    }),
  );

  return emailByUserId;
}

export async function getCourseStudents(
  courseCacheId: string,
): Promise<CourseStudentsResult | { error: string }> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    const admin = getSupabaseAdmin();
    const slug = course.course_slug?.trim();

    if (!slug && !course.wp_course_id) {
      return { course, students: [] };
    }

    let query = admin
      .from("enrollments")
      .select(
        "id, user_id, enrolled_at, progress, status, source, completed_at, course_slug, course_id",
      )
      .neq("status", "cancelled")
      .order("enrolled_at", { ascending: false });

    if (slug && course.wp_course_id) {
      query = query.or(
        `course_slug.eq.${slug},course_id.eq.${course.wp_course_id}`,
      );
    } else if (slug) {
      query = query.eq("course_slug", slug);
    } else if (course.wp_course_id) {
      query = query.eq("course_id", course.wp_course_id);
    }

    const { data: enrollmentRows, error: enrollmentError } = await query;

    if (enrollmentError) {
      console.error("[CourseStudents] enrollments:", enrollmentError.message);
      return { error: "ENROLLMENTS_QUERY_FAILED" };
    }

    const rows = enrollmentRows ?? [];
    if (rows.length === 0) {
      return { course, students: [] };
    }

    const userIds = Array.from(
      new Set(rows.map((row) => String(row.user_id))),
    );

    const [{ data: profiles }, emailByUserId] = await Promise.all([
      admin.from("profiles").select("id, full_name").in("id", userIds),
      loadEmailsByUserIds(userIds),
    ]);

    const nameByUserId = new Map<string, string | null>();
    for (const profile of profiles ?? []) {
      nameByUserId.set(String(profile.id), profile.full_name);
    }

    const students: CourseStudentRow[] = rows.map((row) => {
      const userId = String(row.user_id);
      return {
        enrollment_id: String(row.id),
        user_id: userId,
        full_name: nameByUserId.get(userId) ?? null,
        email: emailByUserId.get(userId) ?? "—",
        enrolled_at: String(row.enrolled_at),
        progress: Number(row.progress ?? 0),
        status: String(row.status),
        source: formatEnrollmentSource(
          typeof row.source === "string" ? row.source : null,
        ),
        completed_at:
          typeof row.completed_at === "string" ? row.completed_at : null,
      };
    });

    return { course, students };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "COURSE_NOT_FOUND") return { error: "COURSE_NOT_FOUND" };
    if (message === "COURSE_ACCESS_DENIED") {
      return { error: "COURSE_ACCESS_DENIED" };
    }
    console.error("[CourseStudents]", message);
    return { error: "UNKNOWN" };
  }
}
