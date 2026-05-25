import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function syncCourseProductSlug(
  wpCourseId: number,
  newSlug: string,
): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("course_products")
      .update({ course_slug: newSlug })
      .eq("wp_course_id", wpCourseId)
      .select("id");

    if (error) {
      console.error("[WP Webhook] course_products slug sync failed:", error.message);
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch (error) {
    console.error("[WP Webhook] course_products slug sync exception:", error);
    return false;
  }
}
