"use server";

import {
  buildCourseCoverStoragePath,
  buildLessonFeaturedStoragePath,
  uploadCourseMediaBuffer,
  validateCourseMediaFile,
} from "@/lib/instructor/course-media-storage";
import { requireCourseCacheAccess } from "@/lib/instructor/course-cache-access";

export async function uploadCourseCoverImage(
  courseCacheId: string,
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { error: "Lütfen bir görsel seçin." };
    }

    const validationError = validateCourseMediaFile(file);
    if (validationError) {
      return { error: validationError };
    }

    const path = buildCourseCoverStoragePath(
      course.instructor_wp_user_id,
      course.id,
      file.type,
    );
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadCourseMediaBuffer(path, buffer, file.type);

    return { url };
  } catch {
    return { error: "Kapak görseli yüklenemedi." };
  }
}

export async function uploadLessonFeaturedImage(
  courseCacheId: string,
  lessonId: string,
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { error: "Lütfen bir görsel seçin." };
    }

    const validationError = validateCourseMediaFile(file);
    if (validationError) {
      return { error: validationError };
    }

    const path = buildLessonFeaturedStoragePath(
      course.instructor_wp_user_id,
      course.id,
      lessonId,
      file.type,
    );
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadCourseMediaBuffer(path, buffer, file.type);

    return { url };
  } catch {
    return { error: "Ders görseli yüklenemedi." };
  }
}
