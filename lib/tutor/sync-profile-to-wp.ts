import { signWebhookPayload } from "@/lib/webhooks/verify-signature";
import { getWpSiteOrigin } from "@/lib/wordpress/wp-site-origin";

export interface SyncProfileToWpParams {
  email: string;
  fullName?: string | null;
  phone?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  wpUserId?: number | null;
}

export interface SyncProfileToWpResult {
  success: boolean;
  wpUserId?: number;
  error?: string;
  skipped?: boolean;
}

export async function syncProfileToWp(
  params: SyncProfileToWpParams,
): Promise<SyncProfileToWpResult> {
  const secret = process.env.WP_WEBHOOK_SECRET;
  const wpOrigin = getWpSiteOrigin();
  const email = params.email.trim().toLowerCase();

  if (!secret) {
    console.warn("[WP Profile Sync] WP_WEBHOOK_SECRET not configured");
    return { success: false, skipped: true, error: "Secret not configured" };
  }

  if (!wpOrigin) {
    console.warn("[WP Profile Sync] WordPress site URL not configured");
    return { success: false, skipped: true, error: "WP URL not configured" };
  }

  if (!email) {
    return { success: false, error: "Invalid email" };
  }

  const payload = JSON.stringify({
    email,
    full_name: params.fullName?.trim() || null,
    phone: params.phone?.trim() || null,
    bio: params.bio?.trim() || null,
    avatar_url: params.avatarUrl?.trim() || null,
    wp_user_id:
      typeof params.wpUserId === "number" && params.wpUserId > 0
        ? params.wpUserId
        : null,
  });

  try {
    const response = await fetch(
      `${wpOrigin}/wp-json/thorius/v1/academy-update-user`,
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
          user_id?: number;
          error?: string;
          message?: string;
        }
      | null;

    if (!response.ok) {
      const message =
        body?.error || body?.message || `HTTP ${response.status}`;
      console.error("[WP Profile Sync] Failed:", message);
      return { success: false, error: message };
    }

    return {
      success: true,
      wpUserId:
        typeof body?.user_id === "number" ? body.user_id : params.wpUserId ?? undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[WP Profile Sync] Request failed:", message);
    return { success: false, error: message };
  }
}
