import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function ensureUserProfile(
  userId: string,
  options?: {
    email?: string | null;
    fullName?: string | null;
    wpUserId?: number | null;
  },
): Promise<void> {
  const admin = getSupabaseAdmin();

  const { data: existing } = await admin
    .from("profiles")
    .select("id, wp_user_id, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (!existing) {
    await admin.from("profiles").upsert(
      {
        id: userId,
        full_name: options?.fullName ?? null,
        wp_user_id:
          typeof options?.wpUserId === "number" && options.wpUserId > 0
            ? options.wpUserId
            : null,
        role: "student",
      },
      { onConflict: "id" },
    );
    return;
  }

  const patch: Record<string, unknown> = {};

  if (
    typeof options?.wpUserId === "number" &&
    options.wpUserId > 0 &&
    !existing.wp_user_id
  ) {
    patch.wp_user_id = options.wpUserId;
  }

  if (options?.fullName && !existing.full_name) {
    patch.full_name = options.fullName;
  }

  if (Object.keys(patch).length > 0) {
    await admin.from("profiles").update(patch).eq("id", userId);
  }
}
