import { ImageResponse } from "next/og";
import { getCourseProduct } from "@/lib/actions/course-products";
import {
  getEffectiveCoursePrice,
  isFreeCourseProduct,
  isPurchasableCourseProduct,
} from "@/lib/course/course-product-utils";
import { fetchCourseBySlug } from "@/lib/wordpress/api";

export const COURSE_OG_SIZE = { width: 1200, height: 630 } as const;
export const COURSE_OG_CONTENT_TYPE = "image/png";

const BRAND = {
  navy: "#060f24",
  navyMid: "#0B1E3F",
  gold: "#D4AF37",
  goldSoft: "rgba(212,175,55,0.85)",
  white: "#ffffff",
  muted: "rgba(255,255,255,0.72)",
};

export function formatCourseOgTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length <= 110) {
    return trimmed;
  }
  return `${trimmed.slice(0, 107).trimEnd()}…`;
}

function titleFontSize(title: string): number {
  if (title.length <= 42) return 58;
  if (title.length <= 68) return 46;
  if (title.length <= 95) return 38;
  return 32;
}

function formatCourseOgPriceLabel(
  product: Awaited<ReturnType<typeof getCourseProduct>>,
  isFreeYoutubeCourse: boolean,
): string | null {
  if (product && isPurchasableCourseProduct(product)) {
    const price = getEffectiveCoursePrice(product);
    return `${price.toLocaleString("tr-TR")} ₺`;
  }

  if (
    isFreeYoutubeCourse ||
    (product && isFreeCourseProduct(product))
  ) {
    return "Ücretsiz";
  }

  return null;
}

export async function getCourseOgAlt(slug: string): Promise<string> {
  const course = await fetchCourseBySlug(slug);
  if (!course) {
    return "Thorius Academy Kurs";
  }
  return `${course.title} | Thorius Academy`;
}

export async function renderCourseOgImage(slug: string): Promise<ImageResponse> {
  const course = await fetchCourseBySlug(slug);

  if (!course) {
    return new ImageResponse(
      (
        <div
          style={{
            background: `linear-gradient(135deg, ${BRAND.navyMid} 0%, ${BRAND.navy} 100%)`,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: BRAND.white,
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Thorius Academy
        </div>
      ),
      { ...COURSE_OG_SIZE },
    );
  }

  const [product] = await Promise.all([getCourseProduct(course.slug)]);
  const displayTitle = formatCourseOgTitle(course.title);
  const category = course.categories[0]?.name ?? "Kurs";
  const priceLabel = formatCourseOgPriceLabel(
    product,
    Boolean(course.youtubeVideoId),
  );
  const excerpt = course.excerpt.trim().slice(0, 120);

  return new ImageResponse(
    (
      <div
        style={{
          background: `linear-gradient(135deg, ${BRAND.navyMid} 0%, ${BRAND.navy} 100%)`,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 42,
              fontWeight: 900,
              color: BRAND.white,
              letterSpacing: -2,
            }}
          >
            THORIUS
            <span style={{ color: BRAND.gold, marginLeft: 4 }}>.</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            {priceLabel ? (
              <div
                style={{
                  background: BRAND.gold,
                  color: BRAND.navy,
                  padding: "10px 22px",
                  borderRadius: 999,
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                {priceLabel}
              </div>
            ) : null}
            <div
              style={{
                border: `2px solid ${BRAND.goldSoft}`,
                color: BRAND.gold,
                padding: "10px 22px",
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {category}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: titleFontSize(displayTitle),
              fontWeight: 800,
              color: BRAND.white,
              lineHeight: 1.15,
              letterSpacing: -1.5,
            }}
          >
            {displayTitle}
          </div>

          {excerpt ? (
            <div
              style={{
                fontSize: 26,
                color: BRAND.muted,
                lineHeight: 1.45,
              }}
            >
              {excerpt}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontSize: 22,
            color: BRAND.goldSoft,
            fontWeight: 500,
          }}
        >
          <span>Perakendenin Yeni Nesil Akademisi</span>
          <span>academy.thorius.com.tr</span>
        </div>
      </div>
    ),
    { ...COURSE_OG_SIZE },
  );
}
