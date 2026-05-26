import { getAuthCallbackUrl, getAppOrigin } from "@/lib/auth/app-url";
import { getResendClient, getResendFromAddress } from "@/lib/resend/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.includes("@") ? trimmed : null;
}

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

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      console.error("[Instructor Provision] listUsers failed:", error.message);
      return null;
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === target,
    );
    if (match) return match.id;

    if (data.users.length < 200) break;
    page += 1;
  }

  return null;
}

async function sendInstructorInviteEmail(
  email: string,
  fullName: string | null,
): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const redirectTo = getAuthCallbackUrl("/panel/egitmen");

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error) {
    console.error("[Instructor Provision] Magic link error:", error.message);
    return false;
  }

  const magicLink =
    data?.properties?.action_link ??
    `${getAppOrigin()}/giris?redirect=${encodeURIComponent("/panel/egitmen")}`;

  try {
    const resend = getResendClient();
    const name = fullName?.trim() || "Eğitmen";
    const { error: emailError } = await resend.emails.send({
      from: getResendFromAddress(),
      to: email,
      subject: "Thorius Academy Eğitmen Paneli",
      html: `
        <p>Merhaba ${name},</p>
        <p>Thorius Academy eğitmen paneliniz hazır. Kurslarınızı, öğrenci sayılarınızı ve yorumları buradan takip edebilirsiniz.</p>
        <p><a href="${magicLink}">Eğitmen paneline giriş yap</a></p>
        <p>Bu bağlantı tek kullanımlıktır. Daha sonra aynı e-posta ile normal giriş yapabilirsiniz.</p>
      `,
    });

    if (emailError) {
      console.error("[Instructor Provision] Email failed:", emailError.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Instructor Provision] Email exception:", err);
    return false;
  }
}

export interface ProvisionInstructorResult {
  userId: string;
  created: boolean;
  inviteSent: boolean;
}

export async function provisionInstructorAcademyAccount(params: {
  email: string | null | undefined;
  fullName: string | null;
  wpUserId: number;
  sendInvite?: boolean;
}): Promise<ProvisionInstructorResult | null> {
  const email = normalizeEmail(params.email);
  if (!email) return null;

  const admin = getSupabaseAdmin();
  let userId: string | null = null;
  let created = false;

  const { data: createdUser, error: createError } =
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: params.fullName,
        source: "tutor_instructor_sync",
        wp_instructor_id: params.wpUserId,
      },
    });

  if (createdUser?.user) {
    userId = createdUser.user.id;
    created = true;
  } else if (createError && isDuplicateEmailError(createError.message)) {
    userId = await findUserIdByEmail(email);
  } else if (createError) {
    console.error(
      `[Instructor Provision] createUser failed (${email}):`,
      createError.message,
    );
    return null;
  }

  if (!userId) return null;

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: userId,
      full_name: params.fullName,
      wp_instructor_id: params.wpUserId,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error(
      `[Instructor Provision] profile upsert failed (${email}):`,
      profileError.message,
    );
  }

  const shouldInvite =
    params.sendInvite ??
    process.env.INSTRUCTOR_SEND_INVITE_EMAIL !== "false";

  let inviteSent = false;
  if (created && shouldInvite) {
    inviteSent = await sendInstructorInviteEmail(email, params.fullName);
  }

  return { userId, created, inviteSent };
}
