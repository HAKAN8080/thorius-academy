import { getSiteUrl } from "@/lib/seo/site-url";
import type { CourseProduct } from "@/types/course-product";
import type { Course } from "@/types/wordpress";

export function buildCourseJsonLd(
  course: Course,
  product: CourseProduct | null,
  coverImageUrl: string | null,
) {
  const siteUrl = getSiteUrl();
  const price =
    product?.price_sale ?? product?.price_normal ?? (course.youtubeVideoId ? 0 : null);

  const offers =
    price != null
      ? {
          "@type": "Offer",
          price: String(price),
          priceCurrency: product?.currency ?? "TRY",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/kurslar/${course.slug}`,
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.excerpt || course.title,
    url: `${siteUrl}/kurslar/${course.slug}`,
    ...(coverImageUrl ? { image: coverImageUrl } : {}),
    provider: {
      "@type": "Organization",
      name: "Thorius Academy",
      url: siteUrl,
    },
    ...(offers ? { offers } : {}),
  };
}
