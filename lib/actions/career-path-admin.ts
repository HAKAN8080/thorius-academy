"use server";

import { revalidatePath } from "next/cache";
import { requireCareerPathAdmin } from "@/lib/career-path/admin-access";
import type { CareerPathAdminInput } from "@/lib/career-path/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const SHARED_MILESTONES = [
  {
    label: "Sertifika",
    description:
      "Her kursu tamamladığınızda dijital katılım belgesi; yolu bitirdiğinizde uzmanlık portföyü.",
  },
  {
    label: "Thorius Coaching",
    description: "CV, mülakat ve kariyer hedefi için bire bir koçluk desteği.",
    href: "/#ecosystem",
  },
  {
    label: "Kurumsal mentorluk",
    description: "Ekip bazlı öğrenme paketleri ve şirket içi uygulama desteği.",
    href: "/kurumsal",
  },
];

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function mapPathRow(input: CareerPathAdminInput) {
  return {
    slug: normalizeSlug(input.slug),
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    hero_eyebrow: input.heroEyebrow.trim() || "Uzmanlık Akademisi",
    outcomes: input.outcomes.filter(Boolean),
    milestones: SHARED_MILESTONES,
    catalog_href: input.catalogHref.trim() || "/kurslar",
    catalog_label: input.catalogLabel.trim() || "İlgili kurslar",
    closing_title: input.closingTitle.trim(),
    closing_description: input.closingDescription.trim(),
    is_published: input.isPublished,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString(),
  };
}

function mapStepRows(careerPathId: string, input: CareerPathAdminInput) {
  return input.steps
    .slice()
    .sort((a, b) => a.stepOrder - b.stepOrder)
    .map((step, index) => ({
      career_path_id: careerPathId,
      step_order: index + 1,
      level: step.level.trim() || `Adım ${index + 1}`,
      label: step.label.trim(),
      course_slug: step.courseSlug.trim(),
      fallback_title: step.fallbackTitle.trim() || step.label.trim(),
      description: step.description.trim(),
    }))
    .filter((step) => step.label && step.course_slug);
}

export async function saveCareerPath(
  input: CareerPathAdminInput,
  id?: string,
): Promise<{ success: boolean; error?: string; id?: string; slug?: string }> {
  try {
    await requireCareerPathAdmin();

    if (!input.title.trim()) {
      return { success: false, error: "Başlık gereklidir." };
    }

    if (!input.slug.trim()) {
      return { success: false, error: "Slug gereklidir." };
    }

    if (input.steps.length === 0) {
      return { success: false, error: "En az bir adım ekleyin." };
    }

    const admin = getSupabaseAdmin();
    const pathRow = mapPathRow(input);
    let pathId = id;

    if (pathId) {
      const { error } = await admin
        .from("career_paths")
        .update(pathRow)
        .eq("id", pathId);

      if (error) {
        console.error("[Career Path Admin] Update error:", error);
        return { success: false, error: "Kariyer yolu güncellenemedi." };
      }
    } else {
      const { data, error } = await admin
        .from("career_paths")
        .insert(pathRow)
        .select("id")
        .single();

      if (error || !data) {
        console.error("[Career Path Admin] Insert error:", error);
        return { success: false, error: "Kariyer yolu oluşturulamadı." };
      }

      pathId = data.id as string;
    }

    const stepRows = mapStepRows(pathId, input);

    const { error: deleteError } = await admin
      .from("career_path_steps")
      .delete()
      .eq("career_path_id", pathId);

    if (deleteError) {
      console.error("[Career Path Admin] Delete steps error:", deleteError);
      return { success: false, error: "Adımlar güncellenemedi." };
    }

    const { error: insertError } = await admin
      .from("career_path_steps")
      .insert(stepRows);

    if (insertError) {
      console.error("[Career Path Admin] Insert steps error:", insertError);
      return { success: false, error: "Adımlar kaydedilemedi." };
    }

    const productRow = {
      career_path_id: pathId,
      career_path_slug: pathRow.slug,
      wc_product_id: input.product.wcProductId,
      price_normal: input.product.priceNormal,
      price_sale: input.product.priceSale,
      is_active: input.product.isActive && input.product.wcProductId > 0,
      currency: "TRY",
    };

    if (input.product.wcProductId > 0) {
      const { error: productError } = await admin
        .from("career_path_products")
        .upsert(productRow, { onConflict: "career_path_id" });

      if (productError) {
        console.error("[Career Path Admin] Product upsert error:", productError);
        return { success: false, error: "Paket ürün bilgisi kaydedilemedi." };
      }
    } else {
      const { error: deactivateError } = await admin
        .from("career_path_products")
        .update({ is_active: false })
        .eq("career_path_id", pathId);

      if (deactivateError) {
        console.warn(
          "[Career Path Admin] Product deactivate warning:",
          deactivateError.message,
        );
      }
    }

    revalidatePath("/panel/yonetim/kariyer-yollari");
    revalidatePath(`/panel/yonetim/kariyer-yollari/${pathRow.slug}`);
    revalidatePath(`/panel/yonetim/kariyer-yollari/${pathId}`);
    revalidatePath("/panel/kariyer-yolu");
    revalidatePath(`/panel/kariyer-yolu/${pathRow.slug}`);
    revalidatePath("/kariyer-yolu");
    revalidatePath(`/kariyer-yolu/${pathRow.slug}`);
    revalidatePath("/");

    return { success: true, id: pathId, slug: pathRow.slug };
  } catch (error) {
    if (error instanceof Error && error.message === "CAREER_PATH_ADMIN_DENIED") {
      return { success: false, error: "Bu işlem için yetkiniz yok." };
    }
    console.error("[Career Path Admin] Save failed:", error);
    return { success: false, error: "Beklenmeyen bir hata oluştu." };
  }
}

export async function deleteCareerPath(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireCareerPathAdmin();

    const admin = getSupabaseAdmin();
    const { error } = await admin.from("career_paths").delete().eq("id", id);

    if (error) {
      console.error("[Career Path Admin] Delete error:", error);
      return { success: false, error: "Kariyer yolu silinemedi." };
    }

    revalidatePath("/panel/yonetim/kariyer-yollari");
    revalidatePath("/panel/kariyer-yolu");
    revalidatePath("/kariyer-yolu");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "CAREER_PATH_ADMIN_DENIED") {
      return { success: false, error: "Bu işlem için yetkiniz yok." };
    }
    console.error("[Career Path Admin] Delete failed:", error);
    return { success: false, error: "Beklenmeyen bir hata oluştu." };
  }
}
