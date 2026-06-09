import { getAuthCallbackUrl } from "@/lib/auth/app-url";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function isDuplicateEmailError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("already been registered") ||
    lower.includes("already exists") ||
    lower.includes("duplicate")
  );
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const target = email.toLowerCase();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      console.error("[Campaign] listUsers failed:", error.message);
      return null;
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === target,
    );
    if (match) {
      return match.id;
    }

    if (data.users.length < 200) {
      break;
    }
    page += 1;
  }

  return null;
}

export async function ensureCampaignUser(params: {
  email: string;
  fullName: string;
}): Promise<{ userId: string; alreadySent: boolean } | null> {
  const admin = getSupabaseAdmin();
  const email = params.email.trim().toLowerCase();
  const fullName = params.fullName.trim() || "Üyemiz";

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        source: "membership_campaign",
      },
    });

  let userId = created?.user?.id ?? null;

  if (!userId && createError && isDuplicateEmailError(createError.message)) {
    userId = await findUserIdByEmail(email);
  }

  if (!userId) {
    console.error("[Campaign] User ensure failed:", createError?.message);
    return null;
  }

  const { data: userData, error: userError } =
    await admin.auth.admin.getUserById(userId);

  if (userError || !userData.user) {
    return null;
  }

  const alreadySent = Boolean(
    userData.user.user_metadata?.membership_renewal_campaign_at,
  );

  return { userId, alreadySent };
}

export async function createPasswordRenewalLink(
  email: string,
): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const redirectTo = getAuthCallbackUrl("/yeni-parola");

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: email.trim().toLowerCase(),
    options: { redirectTo },
  });

  if (error) {
    console.error("[Campaign] Recovery link failed:", error.message);
    return null;
  }

  return data?.properties?.action_link ?? null;
}

export async function markMembershipRenewalSent(userId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const { data: userData } = await admin.auth.admin.getUserById(userId);

  await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...userData.user?.user_metadata,
      membership_renewal_campaign_at: new Date().toISOString(),
    },
  });
}
