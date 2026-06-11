import {
  COURSE_MEDIA_BUCKET,
  uploadCourseMediaBuffer,
} from "@/lib/instructor/course-media-storage";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { INSTRUCTOR_UPLOADS_PER_HOUR } from "@/lib/upload/file-guard";

function uploadEventPrefix(instructorWpUserId: number): string {
  return `${instructorWpUserId}/upload-events`;
}

export async function assertInstructorUploadRateLimit(
  instructorWpUserId: number,
): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const prefix = uploadEventPrefix(instructorWpUserId);
  const { data: files, error } = await admin.storage
    .from(COURSE_MEDIA_BUCKET)
    .list(prefix, { limit: 100, sortBy: { column: "name", order: "desc" } });

  if (error) {
    console.warn("[Upload rate limit] list failed:", error.message);
    return null;
  }

  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentCount = (files ?? []).filter((file) => {
    const timestamp = Number.parseInt(file.name.replace(/\.marker$/i, ""), 10);
    return Number.isFinite(timestamp) && timestamp >= oneHourAgo;
  }).length;

  if (recentCount >= INSTRUCTOR_UPLOADS_PER_HOUR) {
    return `Saatte en fazla ${INSTRUCTOR_UPLOADS_PER_HOUR} dosya yükleyebilirsiniz. Lütfen bir süre bekleyin.`;
  }

  return null;
}

export async function recordInstructorUploadEvent(
  instructorWpUserId: number,
): Promise<void> {
  const path = `${uploadEventPrefix(instructorWpUserId)}/${Date.now()}.marker`;
  await uploadCourseMediaBuffer(path, Buffer.from("1"), "text/plain");
}
