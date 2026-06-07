import { getAllCourseProducts } from "@/lib/actions/course-products";
import { fetchCoursesForListing } from "@/lib/wordpress/api";

export interface AdminCourseOption {
  slug: string;
  title: string;
  categoryLabel: string | null;
}

export async function getAdminCourseOptions(): Promise<AdminCourseOption[]> {
  const [products, listing] = await Promise.all([
    getAllCourseProducts(),
    fetchCoursesForListing(),
  ]);

  const listingBySlug = new Map(
    listing.map((course) => [course.slug, course]),
  );

  const options = products.map((product) => {
    const course = listingBySlug.get(product.course_slug);
    return {
      slug: product.course_slug,
      title: course?.title ?? product.course_slug,
      categoryLabel:
        course?.categories?.map((category) => category.name).join(", ") ??
        null,
    };
  });

  return options.sort((a, b) =>
    a.title.localeCompare(b.title, "tr", { sensitivity: "base" }),
  );
}
