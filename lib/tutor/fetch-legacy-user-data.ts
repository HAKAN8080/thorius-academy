import type { TutorLegacyUserData } from "@/lib/tutor/legacy-user-data";
import { signWebhookPayload } from "@/lib/webhooks/verify-signature";
import { getWpSiteOrigin } from "@/lib/wordpress/wp-site-origin";

export async function fetchLegacyUserDataFromWp(
  email: string,
): Promise<TutorLegacyUserData | null> {
  const secret = process.env.WP_WEBHOOK_SECRET;
  const wpOrigin = getWpSiteOrigin();
  const normalizedEmail = email.trim().toLowerCase();

  if (!secret || !wpOrigin || !normalizedEmail) {
    return null;
  }

  const payload = JSON.stringify({ email: normalizedEmail });

  try {
    const response = await fetch(
      `${wpOrigin}/wp-json/thorius/v1/academy-user-legacy`,
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

    if (!response.ok) {
      console.warn(
        "[Legacy Sync] WP request failed:",
        response.status,
        normalizedEmail,
      );
      return null;
    }

    const body = (await response.json().catch(() => null)) as
      | TutorLegacyUserData
      | null;

    if (!body || !Array.isArray(body.enrollments)) {
      return null;
    }

    return body;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Legacy Sync] WP fetch failed:", message);
    return null;
  }
}
