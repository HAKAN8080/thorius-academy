import { signWebhookPayload } from "@/lib/webhooks/verify-signature";
import { getWpSiteOrigin } from "@/lib/wordpress/wp-site-origin";

export interface SyncUserToWpParams {
  email: string;
  fullName?: string | null;
  password: string;
}

export interface SyncUserToWpResult {
  success: boolean;
  created?: boolean;
  wpUserId?: number;
  error?: string;
  skipped?: boolean;
}

export async function syncUserToWpOnSignup(
  params: SyncUserToWpParams,
): Promise<SyncUserToWpResult> {
  const secret = process.env.WP_WEBHOOK_SECRET;
  const wpOrigin = getWpSiteOrigin();
  const email = params.email.trim().toLowerCase();
  const password = params.password;

  if (!secret) {
    console.warn("[WP Register Sync] WP_WEBHOOK_SECRET not configured");
    return { success: false, skipped: true, error: "Secret not configured" };
  }

  if (!wpOrigin) {
    console.warn("[WP Register Sync] WordPress site URL not configured");
    return { success: false, skipped: true, error: "WP URL not configured" };
  }

  if (!email || password.length < 8) {
    return { success: false, error: "Invalid email or password" };
  }

  const payload = JSON.stringify({
    email,
    full_name: params.fullName?.trim() || null,
    password,
  });

  try {
    const response = await fetch(
      `${wpOrigin}/wp-json/thorius/v1/academy-register-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Webhook-Signature": signWebhookPayload(payload, secret),
        },
        body: payload,
        cache: "no-store",
      },
    );

    const body = (await response.json().catch(() => null)) as
      | {
          success?: boolean;
          created?: boolean;
          user_id?: number;
          error?: string;
          message?: string;
        }
      | null;

    if (!response.ok) {
      const message =
        body?.error || body?.message || `HTTP ${response.status}`;
      console.error("[WP Register Sync] Failed:", message);
      return { success: false, error: message };
    }

    return {
      success: true,
      created: body?.created === true,
      wpUserId: typeof body?.user_id === "number" ? body.user_id : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[WP Register Sync] Request failed:", message);
    return { success: false, error: message };
  }
}
