import {
  getCampaignCourseSlugsOverride,
  MEMBERSHIP_RENEWAL_CATEGORY_SLUGS,
  MEMBERSHIP_RENEWAL_PROMO_COURSE_LIMIT,
} from "@/lib/constants/campaign";
import { filterPurchasableCourses } from "@/lib/course/pick-featured-courses";
import { getCourseCatalog } from "@/lib/wordpress/catalog";
import type { Course } from "@/types/wordpress";

export interface PromoCourse {
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
}

function trimExcerpt(text: string, maxLength = 120): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

function toPromoCourse(course: Course): PromoCourse {
  return {
    slug: course.slug,
    title: course.title,
    excerpt: trimExcerpt(course.excerpt || course.title),
    category: course.categories[0]?.name ?? null,
  };
}

export async function pickMembershipRenewalPromoCourses(): Promise<PromoCourse[]> {
  const overrideSlugs = getCampaignCourseSlugsOverride();
  const catalog = await getCourseCatalog();
  const productBySlug = new Map(
    catalog.products.map((product) => [product.course_slug, product]),
  );
  const purchasable = filterPurchasableCourses(catalog.courses, productBySlug);
  const picked: PromoCourse[] = [];
  const usedSlugs = new Set<string>();

  if (overrideSlugs.length > 0) {
    for (const slug of overrideSlugs) {
      if (picked.length >= MEMBERSHIP_RENEWAL_PROMO_COURSE_LIMIT) {
        break;
      }

      const course = purchasable.find((item) => item.slug === slug);
      if (course && !usedSlugs.has(course.slug)) {
        picked.push(toPromoCourse(course));
        usedSlugs.add(course.slug);
      }
    }
  }

  for (const categorySlug of MEMBERSHIP_RENEWAL_CATEGORY_SLUGS) {
    if (picked.length >= MEMBERSHIP_RENEWAL_PROMO_COURSE_LIMIT) {
      break;
    }

    const categoryCourses = [...purchasable]
      .filter(
        (course) =>
          !usedSlugs.has(course.slug) &&
          course.categories.some((category) => category.slug === categorySlug),
      )
      .sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime(),
      );

    for (const course of categoryCourses) {
      if (picked.length >= MEMBERSHIP_RENEWAL_PROMO_COURSE_LIMIT) {
        break;
      }
      picked.push(toPromoCourse(course));
      usedSlugs.add(course.slug);
    }
  }

  if (picked.length < MEMBERSHIP_RENEWAL_PROMO_COURSE_LIMIT) {
    const remaining = [...purchasable]
      .filter((course) => !usedSlugs.has(course.slug))
      .sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime(),
      );

    for (const course of remaining) {
      if (picked.length >= MEMBERSHIP_RENEWAL_PROMO_COURSE_LIMIT) {
        break;
      }
      picked.push(toPromoCourse(course));
    }
  }

  return picked;
}
