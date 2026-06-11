"use server";

import { requireCourseCacheAccess } from "@/lib/instructor/course-cache-access";
import {
  buildLessonPdfStoragePath,
  uploadCourseMediaBuffer,
} from "@/lib/instructor/course-media-storage";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  assertInstructorUploadRateLimit,
  recordInstructorUploadEvent,
} from "@/lib/upload/instructor-rate-limit";
import {
  sanitizeFileBaseName,
  validateLessonPdfBuffer,
  validateLessonPdfMeta,
  validateLessonVideoMeta,
} from "@/lib/upload/file-guard";
import { resolveBunnyCourseUploadTarget } from "@/lib/video/bunny-collections";
import { createBunnyVideoUploadSession } from "@/lib/video/bunny-tus-auth";

async function resolveCourseCacheId(
  courseCacheId?: string,
  wpCourseId?: number,
): Promise<
  | Awaited<ReturnType<typeof requireCourseCacheAccess>>
  | { error: string }
> {
  if (courseCacheId) {
    try {
      return await requireCourseCacheAccess(courseCacheId);
    } catch {
      return { error: "Bu kursa erişim yetkiniz yok." };
    }
  }

  if (!wpCourseId) {
    return { error: "Kurs bilgisi eksik." };
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("courses_cache")
    .select("id")
    .eq("wp_course_id", wpCourseId)
    .maybeSingle();

  if (error || !data?.id) {
    return { error: "Kurs bulunamadı." };
  }

  try {
    return await requireCourseCacheAccess(data.id as string);
  } catch {
    return { error: "Bu kursa erişim yetkiniz yok." };
  }
}

export async function prepareLessonVideoUpload(input: {
  courseCacheId?: string;
  wpCourseId?: number;
  lessonId: string;
  lessonTitle: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}): Promise<
  | {
      libraryId: string;
      videoId: string;
      playUrl: string;
      tusEndpoint: string;
      authorizationSignature: string;
      authorizationExpire: number;
    }
  | { error: string }
> {
  try {
    const courseResult = await resolveCourseCacheId(
      input.courseCacheId,
      input.wpCourseId,
    );
    if ("error" in courseResult) {
      return courseResult;
    }

    const metaError = validateLessonVideoMeta({
      name: input.fileName,
      size: input.fileSize,
      type: input.mimeType,
    });
    if (metaError) {
      return { error: metaError };
    }

    const rateError = await assertInstructorUploadRateLimit(
      courseResult.instructor_wp_user_id,
    );
    if (rateError) {
      return { error: rateError };
    }

    const uploadTarget = await resolveBunnyCourseUploadTarget(
      {
        courseTitle: courseResult.title,
        courseSlug: courseResult.course_slug,
        wpCourseId: courseResult.wp_course_id,
      },
      input.lessonTitle,
    );
    if ("error" in uploadTarget) {
      return uploadTarget;
    }

    const session = await createBunnyVideoUploadSession(uploadTarget.videoTitle, {
      collectionId: uploadTarget.collectionId,
    });
    if ("error" in session) {
      return session;
    }

    await recordInstructorUploadEvent(courseResult.instructor_wp_user_id);
    return session;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[prepareLessonVideoUpload]", message);
    return { error: "Video yükleme oturumu açılamadı. Lütfen tekrar deneyin." };
  }
}

export async function uploadLessonPdfAttachment(
  input: {
    courseCacheId?: string;
    wpCourseId?: number;
    lessonId: string;
    formData: FormData;
  },
): Promise<{ url: string; name: string } | { error: string }> {
  try {
    const courseResult = await resolveCourseCacheId(
      input.courseCacheId,
      input.wpCourseId,
    );
    if ("error" in courseResult) {
      return courseResult;
    }
    const course = courseResult;
    const file = input.formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { error: "Lütfen bir PDF seçin." };
    }

    const metaError = validateLessonPdfMeta(file);
    if (metaError) {
      return { error: metaError };
    }

    const rateError = await assertInstructorUploadRateLimit(
      course.instructor_wp_user_id,
    );
    if (rateError) {
      return { error: rateError };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bufferError = validateLessonPdfBuffer(buffer);
    if (bufferError) {
      return { error: bufferError };
    }

    const path = buildLessonPdfStoragePath(
      course.instructor_wp_user_id,
      course.id,
      input.lessonId,
      sanitizeFileBaseName(file.name),
    );
    const url = await uploadCourseMediaBuffer(path, buffer, "application/pdf");
    await recordInstructorUploadEvent(course.instructor_wp_user_id);

    return { url, name: file.name };
  } catch {
    return { error: "PDF yüklenemedi." };
  }
}
