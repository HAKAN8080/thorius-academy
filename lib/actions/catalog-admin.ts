"use server";

import { revalidatePath } from "next/cache";
import { requireCareerPathAdmin } from "@/lib/career-path/admin-access";
import {
  bulkSetAdminCatalogCoursesPublished,
  listAdminCatalogCourses,
  setAdminCatalogCoursePublished,
  type CatalogPublishedFilter,
  type ListAdminCatalogCoursesResult,
} from "@/lib/course/catalog-admin";
import { revalidateCourseCache } from "@/lib/webhooks/revalidate-course-cache";

export async function getAdminCatalogCourses(input: {
  search?: string;
  category?: string;
  published?: CatalogPublishedFilter;
  page?: number;
}): Promise<ListAdminCatalogCoursesResult | { error: string }> {
  try {
    await requireCareerPathAdmin();
    return await listAdminCatalogCourses(input);
  } catch (error) {
    if (error instanceof Error && error.message === "CAREER_PATH_ADMIN_DENIED") {
      return { error: "Bu sayfaya erişim yetkiniz yok." };
    }
    return {
      error: error instanceof Error ? error.message : "Kurs listesi alınamadı.",
    };
  }
}

export async function toggleAdminCatalogCoursePublished(
  courseId: string,
  published: boolean,
): Promise<{ course: Awaited<ReturnType<typeof setAdminCatalogCoursePublished>> } | { error: string }> {
  try {
    await requireCareerPathAdmin();
    const course = await setAdminCatalogCoursePublished(courseId, published);

    revalidateCourseCache({ slug: course.slug });
    revalidatePath("/panel/yonetim/kurslar");
    revalidatePath("/kurslar");

    return { course };
  } catch (error) {
    if (error instanceof Error && error.message === "CAREER_PATH_ADMIN_DENIED") {
      return { error: "Bu işlem için yetkiniz yok." };
    }
    return {
      error: error instanceof Error ? error.message : "Yayın durumu güncellenemedi.",
    };
  }
}

export async function bulkToggleAdminCatalogCoursesPublished(input: {
  search?: string;
  category?: string;
  published?: CatalogPublishedFilter;
  nextPublished: boolean;
}): Promise<{ updated: number } | { error: string }> {
  try {
    await requireCareerPathAdmin();

    const result = await bulkSetAdminCatalogCoursesPublished(
      {
        search: input.search,
        category: input.category,
        published: input.published,
      },
      input.nextPublished,
    );

    for (const slug of result.slugs.slice(0, 20)) {
      revalidateCourseCache({ slug });
    }
    revalidateCourseCache({});
    revalidatePath("/panel/yonetim/kurslar");
    revalidatePath("/kurslar");
    revalidatePath("/");

    return { updated: result.updated };
  } catch (error) {
    if (error instanceof Error && error.message === "CAREER_PATH_ADMIN_DENIED") {
      return { error: "Bu işlem için yetkiniz yok." };
    }
    return {
      error: error instanceof Error ? error.message : "Toplu güncelleme başarısız.",
    };
  }
}
