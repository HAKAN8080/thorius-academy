"use server";

import { canAccessKitaplikAdmin } from "@/lib/kitaplik/access";
import {
  getKitaplikAdminUserDetail,
  listKitaplikAdminUsers,
  type KitaplikAdminUserDetail,
  type KitaplikAdminUserSummary,
} from "@/lib/kitaplik/admin-users";
import { createClient } from "@/lib/supabase/server";

async function requireKitaplikAdminAction(): Promise<
  { userId: string; email: string } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Bu islem icin giris yapmalisiniz." };
  }

  const email = user.email?.trim() ?? "";
  if (!canAccessKitaplikAdmin(email)) {
    return { error: "Bu sayfaya erisim yetkiniz yok." };
  }

  return { userId: user.id, email };
}

export async function listKitaplikAdminUsersAction(): Promise<
  { users: KitaplikAdminUserSummary[] } | { error: string }
> {
  const access = await requireKitaplikAdminAction();
  if ("error" in access) return access;

  try {
    const users = await listKitaplikAdminUsers();
    return { users };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Kullanicilar yuklenemedi.",
    };
  }
}

export async function getKitaplikAdminUserDetailAction(
  userId: string,
): Promise<{ user: KitaplikAdminUserDetail } | { error: string }> {
  const access = await requireKitaplikAdminAction();
  if ("error" in access) return access;

  try {
    const user = await getKitaplikAdminUserDetail(userId);
    if (!user) {
      return { error: "Kullanici bulunamadi." };
    }
    return { user };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Kullanici detayi yuklenemedi.",
    };
  }
}
