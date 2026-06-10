import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Globally unique negative wp_lesson_id for Academy-native lessons. */
export async function nextSyntheticWpLessonId(): Promise<number> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("lessons")
    .select("wp_lesson_id")
    .lt("wp_lesson_id", 0)
    .order("wp_lesson_id", { ascending: true })
    .limit(1);

  let candidate =
    typeof data?.[0]?.wp_lesson_id === "number" ? data[0].wp_lesson_id - 1 : -1;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data: existing } = await admin
      .from("lessons")
      .select("id")
      .eq("wp_lesson_id", candidate)
      .maybeSingle();

    if (!existing) {
      return candidate;
    }

    candidate -= 1;
  }

  return candidate;
}
