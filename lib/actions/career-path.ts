"use server";

import { revalidatePath } from "next/cache";
import { getCareerPathProduct } from "@/lib/actions/career-path-products";
import { isPurchasableCareerPathProduct } from "@/lib/career-path/career-path-product-utils";
import { createClient } from "@/lib/supabase/server";

export interface CareerPathEnrollResult {
  success: boolean;
  error?: string;
  alreadyEnrolled?: boolean;
}

export async function enrollInCareerPath(
  careerPathId: string,
  slug: string,
): Promise<CareerPathEnrollResult> {
  if (careerPathId.startsWith("static-")) {
    return {
      success: false,
      error:
        "Kariyer yolu kaydı henüz aktif değil. İlk adımdaki kursa kayıt olarak ilerleyebilirsiniz.",
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Giriş yapmalısınız" };
    }

    const pathProduct = await getCareerPathProduct(slug);
    if (isPurchasableCareerPathProduct(pathProduct)) {
      return {
        success: false,
        error:
          "Bu kariyer yolu ücretli bir pakettir. Satın aldıktan sonra panelinizde görünür.",
      };
    }

    const { error } = await supabase.from("career_path_enrollments").insert({
      user_id: user.id,
      career_path_id: careerPathId,
      source: "free",
    });

    if (error) {
      if (error.code === "23505") {
        return { success: true, alreadyEnrolled: true };
      }
      console.error("[Career Path] Enroll error:", error);
      return {
        success: false,
        error: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      };
    }

    revalidatePath("/panel/kariyer-yolu");
    revalidatePath(`/panel/kariyer-yolu/${slug}`);

    return { success: true };
  } catch (error) {
    console.error("[Career Path] Enroll failed:", error);
    return {
      success: false,
      error: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
    };
  }
}
