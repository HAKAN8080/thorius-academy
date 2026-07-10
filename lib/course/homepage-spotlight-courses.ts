import type { Course } from "@/types/wordpress";

export function getHomepageSpotlightSlugs(): string[] {
  const raw = process.env.HOMEPAGE_SPOTLIGHT_SLUGS?.trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

export function pickHomepageSpotlightCourses(
  courses: Course[],
  fallbackLimit = 3,
): Course[] {
  const slugs = getHomepageSpotlightSlugs();
  const bySlug = new Map(courses.map((course) => [course.slug, course]));

  if (slugs.length > 0) {
    return slugs
      .map((slug) => bySlug.get(slug))
      .filter((course): course is Course => Boolean(course));
  }

  return courses.slice(0, fallbackLimit);
}
