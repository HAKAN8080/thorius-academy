import { getSupabasePublicClient } from "@/lib/supabase/public";

/** Published public course slugs for ISR / generateStaticParams. */
export async function getPublishedCourseSlugs(
  limit = 500,
): Promise<string[]> {
  try {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("courses_cache")
      .select("course_slug")
      .eq("published", true)
      .eq("visibility", "public")
      .not("course_slug", "is", null)
      .limit(limit);

    if (error || !data) {
      console.error("[published-course-slugs]", error?.message);
      return [];
    }

    const slugs = data
      .map((row) => String(row.course_slug ?? "").trim())
      .filter(Boolean);

    return Array.from(new Set(slugs));
  } catch (error) {
    console.error("[published-course-slugs] failed:", error);
    return [];
  }
}
