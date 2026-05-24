"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchCourseFullStructure, extractVideoUrl } from "@/lib/tutor/api";
import type { Lesson } from "@/types/lesson";

export async function syncCourseFromTutor(
  courseId: number,
  courseSlug: string
) {
  try {
    const topics = await fetchCourseFullStructure(courseId);
    const supabase = await createClient();
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

    const { error } = await supabase
      .from("lessons")
      .upsert(lessonsToUpsert, { onConflict: "wp_lesson_id" });

    if (error) {
      console.error("Sync error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/panel/kurslarim/${courseSlug}`);
    return { success: true, count: lessonsToUpsert.length };
  } catch (err) {
    console.error("Sync exception:", err);
    return { success: false, error: (err as Error).message };
  }
}

export async function getLessonsForCourse(
  courseSlug: string
): Promise<Lesson[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_slug", courseSlug)
    .order("topic_order", { ascending: true })
    .order("lesson_order", { ascending: true });

  if (error) {
    console.error("Get lessons error:", error);
    return [];
  }

  return (data as Lesson[]) || [];
}
