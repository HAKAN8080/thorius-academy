import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const COURSE_MEDIA_BUCKET = "course-media";
export const COURSE_MEDIA_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateCourseMediaFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Yalnızca JPG, PNG veya WebP yükleyebilirsiniz.";
  }

  if (file.size > COURSE_MEDIA_MAX_BYTES) {
    return "Görsel en fazla 5 MB olabilir.";
  }

  return null;
}

export function buildCourseCoverStoragePath(
  instructorWpUserId: number,
  courseCacheId: string,
  mimeType: string,
): string {
  const ext = EXTENSION_BY_MIME[mimeType] ?? "jpg";
  return `${instructorWpUserId}/courses/${courseCacheId}/cover.${ext}`;
}

export function buildLessonFeaturedStoragePath(
  instructorWpUserId: number,
  courseCacheId: string,
  lessonId: string,
  mimeType: string,
): string {
  const ext = EXTENSION_BY_MIME[mimeType] ?? "jpg";
  return `${instructorWpUserId}/courses/${courseCacheId}/lessons/${lessonId}/featured.${ext}`;
}

export function getCourseMediaPublicUrl(path: string): string {
  const admin = getSupabaseAdmin();
  const { data } = admin.storage.from(COURSE_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCourseMediaBuffer(
  path: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.from(COURSE_MEDIA_BUCKET).upload(path, buffer, {
    contentType: mimeType,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  return getCourseMediaPublicUrl(path);
}
