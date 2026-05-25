import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { syncLessonsFromTutor } from "@/lib/lessons/sync-from-tutor";

export async function syncCourseLessonsFromWebhook(
  courseId: number,
  courseSlug: string,
) {
  const supabase = getSupabaseAdmin();
  return syncLessonsFromTutor(supabase, courseId, courseSlug);
}
