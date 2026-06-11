import { createPasswordRenewalLink } from "@/lib/campaign/membership-renewal-user";
import { ensureUserProfile } from "@/lib/profile/ensure-profile";
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
      console.error("[WP Migration] listUsers failed:", error.message);
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

export interface EnsureWpMigrationUserResult {
  userId: string;
  created: boolean;
  alreadyMigrated: boolean;
}

export async function ensureWpMigrationUser(params: {
  email: string;
  fullName: string;
  wpUserId: number;
}): Promise<EnsureWpMigrationUserResult | null> {
  const admin = getSupabaseAdmin();
  const email = params.email.trim().toLowerCase();
  const fullName = params.fullName.trim() || "Üyemiz";
  const wpUserId = params.wpUserId;

  if (!email || wpUserId <= 0) {
    return null;
  }

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        wp_user_id: wpUserId,
        source: "wp_migration",
      },
    });

  let userId = created?.user?.id ?? null;
  let wasCreated = Boolean(userId);

  if (!userId && createError && isDuplicateEmailError(createError.message)) {
    userId = await findUserIdByEmail(email);
    wasCreated = false;
  }

  if (!userId) {
    console.error("[WP Migration] User ensure failed:", createError?.message);
    return null;
  }

  const { data: userData, error: userError } =
    await admin.auth.admin.getUserById(userId);

  if (userError || !userData.user) {
    return null;
  }

  const alreadyMigrated = Boolean(
    userData.user.user_metadata?.wp_migration_at,
  );

  const metadataPatch: Record<string, unknown> = {
    ...userData.user.user_metadata,
    full_name: fullName,
    wp_user_id: wpUserId,
  };

  if (!userData.user.user_metadata?.source) {
    metadataPatch.source = "wp_migration";
  }

  await admin.auth.admin.updateUserById(userId, {
    user_metadata: metadataPatch,
  });

  await ensureUserProfile(userId, {
    email,
    fullName,
    wpUserId,
  });

  return {
    userId,
    created: wasCreated,
    alreadyMigrated,
  };
}

export async function markWpMigrationComplete(userId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const { data: userData } = await admin.auth.admin.getUserById(userId);

  await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...userData.user?.user_metadata,
      wp_migration_at: new Date().toISOString(),
    },
  });
}

export async function sendWpMigrationInvite(email: string): Promise<boolean> {
  const link = await createPasswordRenewalLink(email);
  return Boolean(link);
}
