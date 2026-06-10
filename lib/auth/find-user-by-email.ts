import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function findAuthUserByEmail(
  email: string,
): Promise<User | null> {
  const admin = getSupabaseAdmin();
  const target = email.trim().toLowerCase();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      console.error("[Auth] listUsers failed:", error.message);
      return null;
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === target,
    );
    if (match) {
      return match;
    }

    if (data.users.length < 200) {
      break;
    }
    page += 1;
  }

  return null;
}
