import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { signWebhookPayload } from "@/lib/webhooks/verify-signature";
import { getCoachingSiteOrigin } from "@/lib/wordpress/wp-site-origin";

export interface ProvisionCoachingAccountParams {
  email: string;
  fullName?: string | null;
  password: string;
}

export interface ProvisionCoachingAccountResult {
  success: boolean;
  created?: boolean;
  skipped?: boolean;
  error?: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isDuplicateEmailError(message: string): boolean {
  return /already (registered|exists|been registered)/i.test(message);
}

function getAcademySupabaseUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? null;
}

function getCoachingSupabaseAdmin(): SupabaseClient | null {
  const coachingUrl = process.env.COACHING_SUPABASE_URL?.replace(/\/$/, "");
  const coachingKey =
    process.env.COACHING_SUPABASE_SERVICE_ROLE_KEY ??
    process.env.COACHING_SUPABASE_SECRET_KEY;

  if (!coachingUrl || !coachingKey) {
    return null;
  }

  return createClient(coachingUrl, coachingKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function provisionViaCoachingSupabase(
  params: ProvisionCoachingAccountParams,
): Promise<ProvisionCoachingAccountResult> {
  const coachingUrl = process.env.COACHING_SUPABASE_URL?.replace(/\/$/, "");
  const academyUrl = getAcademySupabaseUrl();

  if (coachingUrl && academyUrl && coachingUrl === academyUrl) {
    return {
      success: true,
      skipped: true,
    };
  }

  const admin = getCoachingSupabaseAdmin();
  if (!admin) {
    return {
      success: false,
      skipped: true,
      error: "Coaching Supabase not configured",
    };
  }

  const email = normalizeEmail(params.email);

  const { data: createdUser, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password: params.password,
      email_confirm: true,
      user_metadata: {
        full_name: params.fullName?.trim() || null,
        source: "academy_signup",
      },
    });

  if (createdUser?.user) {
    return { success: true, created: true };
  }

  if (createError && isDuplicateEmailError(createError.message)) {
    return { success: true, created: false };
  }

  console.error("[Coaching Provision] createUser failed:", createError?.message);
  return {
    success: false,
    error: createError?.message ?? "Coaching account create failed",
  };
}

async function provisionViaCoachingWebhook(
  params: ProvisionCoachingAccountParams,
): Promise<ProvisionCoachingAccountResult> {
  const webhookUrl = process.env.COACHING_REGISTER_WEBHOOK_URL?.trim();
  const secret =
    process.env.COACHING_WEBHOOK_SECRET?.trim() ||
    process.env.WP_WEBHOOK_SECRET?.trim();

  if (!webhookUrl || !secret) {
    return {
      success: false,
      skipped: true,
      error: "Coaching webhook not configured",
    };
  }

  const email = normalizeEmail(params.email);
  const payload = JSON.stringify({
    email,
    full_name: params.fullName?.trim() || null,
    password: params.password,
    source: "academy_signup",
  });

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signWebhookPayload(payload, secret),
      },
      body: payload,
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as
      | { success?: boolean; created?: boolean; error?: string }
      | null;

    if (!response.ok) {
      return {
        success: false,
        error: body?.error ?? `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      created: body?.created === true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

export async function provisionCoachingAccount(
  params: ProvisionCoachingAccountParams,
): Promise<ProvisionCoachingAccountResult> {
  if (!getCoachingSiteOrigin()) {
    return { success: false, skipped: true, error: "Coaching URL missing" };
  }

  const supabaseResult = await provisionViaCoachingSupabase(params);
  if (!supabaseResult.skipped) {
    return supabaseResult;
  }

  const webhookResult = await provisionViaCoachingWebhook(params);
  if (!webhookResult.skipped) {
    return webhookResult;
  }

  console.warn(
    "[Coaching Provision] Skipped — set COACHING_SUPABASE_* or COACHING_REGISTER_WEBHOOK_URL",
  );

  return {
    success: false,
    skipped: true,
    error: "Coaching provisioning not configured",
  };
}
