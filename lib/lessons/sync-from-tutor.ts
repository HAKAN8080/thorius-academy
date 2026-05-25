import {
  extractVideoUrl,
  fetchCourseFullStructureFresh,
} from "@/lib/tutor/api";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface SyncLessonsResult {
  success: boolean;
  count?: number;
  error?: string;
}

export async function syncLessonsFromTutor(
  supabase: SupabaseClient,
  courseId: number,
  courseSlug: string,
): Promise<SyncLessonsResult> {
  try {
    const topics = await fetchCourseFullStructureFresh(courseId);
    let lessonOrder = 1;
    const lessonsToUpsert = [];

    for (const topic of topics) {
      for (const lesson of topic.lessons) {
        const videoInfo = extractVideoUrl(lesson.video);
        lessonsToUpsert.push({
          course_id: courseId,
          course_slug: courseSlug,
          wp_lesson_id: lesson.ID,
          lesson_order: lessonOrder++,
          title: lesson.post_title,
          description: lesson.post_content || null,
          duration_seconds: videoInfo.duration || null,
          video_type: videoInfo.type,
          video_url: videoInfo.url,
          video_embed_url: videoInfo.embedUrl,
          topic_title: topic.topic_title,
          topic_order: topic.topic_order,
          is_free: false,
        });
      }
    }

    if (lessonsToUpsert.length === 0) {
      return { success: true, count: 0 };
    }

    const { error } = await supabase
      .from("lessons")
      .upsert(lessonsToUpsert, { onConflict: "wp_lesson_id" });

    if (error) {
      console.error("[Lesson Sync] Upsert failed:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, count: lessonsToUpsert.length };
  } catch (err) {
    console.error("[Lesson Sync] Exception:", err);
    return { success: false, error: (err as Error).message };
  }
}
