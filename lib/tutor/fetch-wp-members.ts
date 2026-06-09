import { signWebhookPayload } from "@/lib/webhooks/verify-signature";
import { getWpSiteOrigin } from "@/lib/wordpress/wp-site-origin";

export interface WpMemberRecord {
  wp_user_id: number;
  email: string;
  full_name: string;
  course_count: number;
}

export interface WpMemberListResult {
  members: WpMemberRecord[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export async function fetchWpMembersPage(params: {
  offset: number;
  limit: number;
}): Promise<WpMemberListResult | null> {
  const secret = process.env.WP_WEBHOOK_SECRET;
  const wpOrigin = getWpSiteOrigin();

  if (!secret || !wpOrigin) {
    return null;
  }

  const payload = JSON.stringify({
    offset: params.offset,
    limit: params.limit,
  });

  try {
    const response = await fetch(
      `${wpOrigin}/wp-json/thorius/v1/academy-member-list`,
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
      console.warn("[Campaign] WP member list failed:", response.status);
      return null;
    }

    const body = (await response.json().catch(() => null)) as
      | WpMemberListResult
      | null;

    if (!body || !Array.isArray(body.members)) {
      return null;
    }

    return body;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Campaign] WP member list error:", message);
    return null;
  }
}
