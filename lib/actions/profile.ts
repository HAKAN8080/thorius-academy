"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ensureUserProfile } from "@/lib/profile/ensure-profile";
import { syncProfileToWp } from "@/lib/tutor/sync-profile-to-wp";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  wp_user_id: number | null;
  role: "student" | "instructor" | "admin";
}

export type ProfileActionState = {
  success?: boolean;
  error?: string;
  message?: string;
};

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : null;

  const wpUserIdMeta =
    typeof user.user_metadata?.wp_user_id === "number"
      ? user.user_metadata.wp_user_id
      : null;

  await ensureUserProfile(user.id, {
    email: user.email,
    fullName: metadataName,
    wpUserId: wpUserIdMeta,
  });

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, phone, bio, avatar_url, wp_user_id, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name ?? metadataName,
    phone: profile?.phone ?? null,
    bio: profile?.bio ?? null,
    avatar_url: profile?.avatar_url ?? null,
    wp_user_id: profile?.wp_user_id ?? wpUserIdMeta,
    role: profile?.role ?? "student",
  };
}

export async function updateUserProfile(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Giriş yapmalısınız" };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  if (fullName.length < 2) {
    return { error: "Ad soyad en az 2 karakter olmalıdır" };
  }

  if (avatarUrl && !/^https?:\/\//i.test(avatarUrl)) {
    return { error: "Profil fotoğrafı geçerli bir URL olmalıdır" };
  }

  const admin = getSupabaseAdmin();

  const { data: existing } = await admin
    .from("profiles")
    .select("wp_user_id")
    .eq("id", user.id)
    .maybeSingle();

  const wpUserId =
    existing?.wp_user_id ??
    (typeof user.user_metadata?.wp_user_id === "number"
      ? user.user_metadata.wp_user_id
      : null);

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      phone: phone || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
      wp_user_id: wpUserId,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("[Profile] Update failed:", profileError.message);
    return { error: "Profil kaydedilemedi. Lütfen tekrar deneyin." };
  }

  await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  const wpResult = await syncProfileToWp({
    email: user.email,
    fullName,
    phone: phone || null,
    bio: bio || null,
    avatarUrl: avatarUrl || null,
    wpUserId,
  });

  if (!wpResult.success && !wpResult.skipped) {
    console.warn("[Profile] WP sync failed:", wpResult.error);
  }

  if (wpResult.wpUserId && !existing?.wp_user_id) {
    await admin
      .from("profiles")
      .update({ wp_user_id: wpResult.wpUserId })
      .eq("id", user.id);
  }

  revalidatePath("/panel");
  revalidatePath("/panel/profil");

  const wpNote =
    wpResult.skipped || wpResult.success
      ? ""
      : " WordPress senkronizasyonu şu an tamamlanamadı; profiliniz Academy'de kaydedildi.";

  return {
    success: true,
    message: `Profiliniz güncellendi.${wpNote}`,
  };
}
