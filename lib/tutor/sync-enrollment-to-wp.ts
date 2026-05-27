import { signWebhookPayload } from "@/lib/webhooks/verify-signature";

export interface SyncEnrollmentToWpParams {
  email: string;
  fullName?: string | null;
  wpCourseId: number;
}

export interface SyncEnrollmentToWpResult {
  success: boolean;
  alreadyEnrolled?: boolean;
  wpUserId?: number;
  error?: string;
  skipped?: boolean;
}

function getWpSiteOrigin(): string | null {
  const siteUrl =
    process.env.NEXT_PUBLIC_WP_SITE_URL?.replace(/\/$/, "") ||
    process.env.WP_API_URL?.replace(/\/$/, "");
  if (siteUrl) return siteUrl;

  const wpApi = process.env.NEXT_PUBLIC_WP_API_URL;
  if (wpApi) {
    return wpApi.replace(/\/wp-json\/wp\/v2\/?$/, "");
  }

  return null;
}

export async function syncEnrollmentToWp(
  params: SyncEnrollmentToWpParams,
): Promise<SyncEnrollmentToWpResult> {
  const secret = process.env.WP_WEBHOOK_SECRET;
  const wpOrigin = getWpSiteOrigin();
  const email = params.email.trim().toLowerCase();

  if (!secret) {
    console.warn("[Enrollment Sync] WP_WEBHOOK_SECRET not configured");
    return { success: false, skipped: true, error: "Secret not configured" };
  }

  if (!wpOrigin) {
    console.warn("[Enrollment Sync] WordPress site URL not configured");
    return { success: false, skipped: true, error: "WP URL not configured" };
  }

  if (!email || params.wpCourseId <= 0) {
    return { success: false, error: "Invalid email or course id" };
  }

  const payload = JSON.stringify({
    email,
    course_id: params.wpCourseId,
    full_name: params.fullName?.trim() || null,
  });

  try {
    const response = await fetch(`${wpOrigin}/wp-json/thorius/v1/academy-enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WP-Webhook-Signature": signWebhookPayload(payload, secret),
      },
      body: payload,
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as
      | {
          success?: boolean;
          already_enrolled?: boolean;
          user_id?: number;
          error?: string;
          message?: string;
        }
      | null;

    if (!response.ok) {
      const message =
        body?.error || body?.message || `HTTP ${response.status}`;
      console.error("[Enrollment Sync] Failed:", message);
      return { success: false, error: message };
    }

    return {
      success: true,
      alreadyEnrolled: body?.already_enrolled === true,
      wpUserId: typeof body?.user_id === "number" ? body.user_id : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Enrollment Sync] Request failed:", message);
    return { success: false, error: message };
  }
}
