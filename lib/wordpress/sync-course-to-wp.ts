import { signWebhookPayload } from "@/lib/webhooks/verify-signature";
import { getWpSiteOrigin } from "@/lib/wordpress/wp-site-origin";
import type {
  AcademySyncCourseToWpRequest,
  AcademySyncCourseToWpResponse,
} from "@/types/wordpress-webhook";

export interface SyncCourseToWpParams {
  academyCourseId: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImageUrl?: string | null;
  category?: string | null;
  price?: number;
  salePrice?: number | null;
  instructorWpUserId: number;
  published: boolean;
  wpCourseId?: number | null;
}

export interface SyncCourseToWpResult {
  success: boolean;
  wpCourseId?: number;
  wcProductId?: number | null;
  slug?: string;
  status?: string;
  error?: string;
  skipped?: boolean;
}

function buildPayload(params: SyncCourseToWpParams): AcademySyncCourseToWpRequest {
  const wpCourseId =
    typeof params.wpCourseId === "number" && params.wpCourseId > 0
      ? params.wpCourseId
      : undefined;

  return {
    academy_course_id: params.academyCourseId,
    title: params.title.trim(),
    slug: params.slug.trim(),
    description: params.description?.trim() || null,
    cover_image_url: params.coverImageUrl?.trim() || null,
    category: params.category?.trim() || null,
    price: params.price ?? 0,
    sale_price: params.salePrice ?? null,
    instructor_wp_user_id: params.instructorWpUserId,
    published: params.published,
    wp_course_id: wpCourseId,
  };
}

export async function syncCourseToWp(
  params: SyncCourseToWpParams,
): Promise<SyncCourseToWpResult> {
  const secret = process.env.WP_WEBHOOK_SECRET;
  const wpOrigin = getWpSiteOrigin();

  if (!secret) {
    console.warn("[Course WP Sync] WP_WEBHOOK_SECRET not configured");
    return {
      success: false,
      skipped: true,
      error: "WordPress senkronizasyonu yapılandırılmamış.",
    };
  }

  if (!wpOrigin) {
    console.warn("[Course WP Sync] WordPress site URL not configured");
    return {
      success: false,
      skipped: true,
      error: "WordPress site adresi yapılandırılmamış.",
    };
  }

  if (!params.academyCourseId || !params.title.trim() || !params.slug.trim()) {
    return {
      success: false,
      error: "Kurs bilgileri eksik; WordPress senkronizasyonu yapılamadı.",
    };
  }

  const payloadObject = buildPayload(params);
  const payload = JSON.stringify(payloadObject);

  try {
    const response = await fetch(
      `${wpOrigin}/wp-json/thorius/v1/academy-sync-course`,
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
      | AcademySyncCourseToWpResponse
      | { error?: string; message?: string }
      | null;

    if (!response.ok) {
      const message =
        body && "error" in body && body.error
          ? body.error
          : body && "message" in body && body.message
            ? body.message
            : `HTTP ${response.status}`;
      console.error("[Course WP Sync] Failed:", message);
      return {
        success: false,
        error: message,
      };
    }

    if (!body || !("wp_course_id" in body) || typeof body.wp_course_id !== "number") {
      return {
        success: false,
        error: "WordPress yanıtı geçersiz.",
      };
    }

    return {
      success: true,
      wpCourseId: body.wp_course_id,
      wcProductId: body.wc_product_id ?? null,
      slug: body.slug,
      status: body.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Course WP Sync] Request failed:", message);
    return {
      success: false,
      error: "WordPress ile bağlantı kurulamadı.",
    };
  }
}
