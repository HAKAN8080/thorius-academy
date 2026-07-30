import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface KitaplikAdminUserBook {
  entitlementId: string;
  bookId: string;
  title: string;
  slug: string;
  grantedAt: string;
  wcOrderId: number | null;
}

export interface KitaplikAdminUserSummary {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  registeredAt: string;
  bookCount: number;
  hasPurchases: boolean;
}

export interface KitaplikAdminUserDetail extends KitaplikAdminUserSummary {
  books: KitaplikAdminUserBook[];
  lastSignInAt: string | null;
  emailConfirmedAt: string | null;
}

async function listAllAuthUsers(): Promise<User[]> {
  const admin = getSupabaseAdmin();
  const users: User[] = [];

  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`Kullanicilar yuklenemedi: ${error.message}`);
    }

    users.push(...(data.users ?? []));
    if ((data.users?.length ?? 0) < perPage) {
      break;
    }
    page += 1;
    if (page > 100) {
      break;
    }
  }

  return users;
}

/** Soft-delete / anonimlestirilmis hesaplar (deleted@site.invalid, [silinmiş], …). */
export function isAnonymizedOrDeletedAuthUser(input: {
  email?: string | null;
  fullName?: string | null;
}): boolean {
  const email = (input.email ?? "").trim().toLowerCase();
  const fullName = (input.fullName ?? "").trim().toLowerCase();

  if (!email || email === "(e-posta yok)") return true;
  if (email === "deleted@site.invalid") return true;
  if (email.endsWith("@site.invalid")) return true;
  if (email.startsWith("deleted@")) return true;
  if (fullName.includes("[silinmiş]") || fullName.includes("[silinmis]")) {
    return true;
  }
  if (fullName === "silinmiş" || fullName === "silinmis") return true;

  return false;
}

export async function listKitaplikAdminUsers(): Promise<
  KitaplikAdminUserSummary[]
> {
  const admin = getSupabaseAdmin();
  const [authUsers, profilesResult, entitlementsResult] = await Promise.all([
    listAllAuthUsers(),
    admin.from("profiles").select("id, full_name, phone"),
    admin.from("ebook_entitlements").select("user_id"),
  ]);

  if (profilesResult.error) {
    throw new Error(`Profiller yuklenemedi: ${profilesResult.error.message}`);
  }
  if (entitlementsResult.error) {
    throw new Error(
      `Kitap haklari yuklenemedi: ${entitlementsResult.error.message}`,
    );
  }

  const profileById = new Map(
    (profilesResult.data ?? []).map((row) => [
      String(row.id),
      {
        fullName: (row.full_name as string | null) ?? null,
        phone: (row.phone as string | null) ?? null,
      },
    ]),
  );

  const bookCountByUser = new Map<string, number>();
  for (const row of entitlementsResult.data ?? []) {
    const userId = String(row.user_id);
    bookCountByUser.set(userId, (bookCountByUser.get(userId) ?? 0) + 1);
  }

  const summaries: KitaplikAdminUserSummary[] = authUsers
    .map((user) => {
      const profile = profileById.get(user.id);
      const bookCount = bookCountByUser.get(user.id) ?? 0;
      return {
        userId: user.id,
        email: user.email?.trim() ?? "(e-posta yok)",
        fullName: profile?.fullName ?? null,
        phone: profile?.phone ?? null,
        registeredAt: user.created_at,
        bookCount,
        hasPurchases: bookCount > 0,
      };
    })
    .filter(
      (user) =>
        !isAnonymizedOrDeletedAuthUser({
          email: user.email,
          fullName: user.fullName,
        }),
    );

  summaries.sort((a, b) => {
    if (b.bookCount !== a.bookCount) return b.bookCount - a.bookCount;
    return b.registeredAt.localeCompare(a.registeredAt);
  });

  return summaries;
}

export async function getKitaplikAdminUserDetail(
  userId: string,
): Promise<KitaplikAdminUserDetail | null> {
  const admin = getSupabaseAdmin();
  const trimmedId = userId.trim();
  if (!trimmedId) return null;

  const [{ data: authData, error: authError }, profileResult, entsResult] =
    await Promise.all([
      admin.auth.admin.getUserById(trimmedId),
      admin
        .from("profiles")
        .select("full_name, phone")
        .eq("id", trimmedId)
        .maybeSingle(),
      admin
        .from("ebook_entitlements")
        .select(
          "id, granted_at, wc_order_id, library_book_id, library_books(id, title, slug)",
        )
        .eq("user_id", trimmedId)
        .order("granted_at", { ascending: false }),
    ]);

  if (authError || !authData.user) {
    return null;
  }

  const user = authData.user;
  const fullName = (profileResult.data?.full_name as string | null) ?? null;
  if (
    isAnonymizedOrDeletedAuthUser({
      email: user.email,
      fullName,
    })
  ) {
    return null;
  }

  if (entsResult.error) {
    throw new Error(`Kitap haklari yuklenemedi: ${entsResult.error.message}`);
  }

  const books: KitaplikAdminUserBook[] = (entsResult.data ?? []).map((row) => {
    const book = row.library_books as unknown as {
      id?: string;
      title?: string;
      slug?: string;
    } | null;

    return {
      entitlementId: String(row.id),
      bookId: String(book?.id ?? row.library_book_id),
      title: book?.title?.trim() || "Bilinmeyen kitap",
      slug: book?.slug?.trim() || "",
      grantedAt: String(row.granted_at),
      wcOrderId:
        row.wc_order_id === null || row.wc_order_id === undefined
          ? null
          : Number(row.wc_order_id),
    };
  });

  return {
    userId: user.id,
    email: user.email?.trim() ?? "(e-posta yok)",
    fullName,
    phone: (profileResult.data?.phone as string | null) ?? null,
    registeredAt: user.created_at,
    bookCount: books.length,
    hasPurchases: books.length > 0,
    books,
    lastSignInAt: user.last_sign_in_at ?? null,
    emailConfirmedAt: user.email_confirmed_at ?? null,
  };
}

/** Auth kullanicisini ve bagli profil / e-kitap haklarini kaldirir. */
export async function deleteKitaplikAdminUser(
  userId: string,
): Promise<{ ok: true } | { error: string }> {
  const admin = getSupabaseAdmin();
  const trimmedId = userId.trim();
  if (!trimmedId) {
    return { error: "Gecersiz kullanici." };
  }

  const { error: entsError } = await admin
    .from("ebook_entitlements")
    .delete()
    .eq("user_id", trimmedId);
  if (entsError) {
    return { error: `E-kitap haklari silinemedi: ${entsError.message}` };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .delete()
    .eq("id", trimmedId);
  if (profileError) {
    // Profil yoksa devam et
    if (!profileError.message.toLowerCase().includes("0 rows")) {
      // non-fatal for missing profile
    }
  }

  const { error: authError } = await admin.auth.admin.deleteUser(trimmedId);
  if (authError) {
    return { error: `Kullanici silinemedi: ${authError.message}` };
  }

  return { ok: true };
}
