import { resolveCourseEnrollmentMeta } from "@/lib/career-path/enrollment-meta";
import { listCareerPathStepsFromDb } from "@/lib/career-path/repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CareerPathProduct } from "@/types/career-path-product";
import type { Database } from "@/types/database";

type EnrollmentInsert = Database["public"]["Tables"]["enrollments"]["Insert"];

export interface FulfillCareerPathPurchaseResult {
  success: boolean;
  pathSlug: string;
  pathTitle: string;
  firstCourseSlug?: string;
  firstCourseTitle?: string;
  error?: string;
}

export async function fulfillCareerPathPurchase(params: {
  userId: string;
  wcOrderId: number;
  pathProduct: CareerPathProduct;
  orderTotal: number;
  lineItemName: string;
}): Promise<FulfillCareerPathPurchaseResult> {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: existingPathEnrollment } = await admin
    .from("career_path_enrollments")
    .select("id")
    .eq("wc_order_id", params.wcOrderId)
    .maybeSingle();

  if (existingPathEnrollment) {
    const steps = await listCareerPathStepsFromDb(
      params.pathProduct.career_path_id,
      params.pathProduct.career_path_slug,
    );
    return {
      success: true,
      pathSlug: params.pathProduct.career_path_slug,
      pathTitle: params.lineItemName,
      firstCourseSlug: steps[0]?.course_slug,
      firstCourseTitle: steps[0]?.fallback_title || steps[0]?.label,
    };
  }

  const steps = await listCareerPathStepsFromDb(
    params.pathProduct.career_path_id,
    params.pathProduct.career_path_slug,
  );

  if (steps.length === 0) {
    return {
      success: false,
      pathSlug: params.pathProduct.career_path_slug,
      pathTitle: params.lineItemName,
      error: "Career path has no steps",
    };
  }

  const firstStep = steps[0];
  const courseMeta = await resolveCourseEnrollmentMeta(firstStep.course_slug);

  if (!courseMeta) {
    return {
      success: false,
      pathSlug: params.pathProduct.career_path_slug,
      pathTitle: params.lineItemName,
      error: `Course not found: ${firstStep.course_slug}`,
    };
  }

  const { error: pathEnrollError } = await admin
    .from("career_path_enrollments")
    .upsert(
      {
        user_id: params.userId,
        career_path_id: params.pathProduct.career_path_id,
        source: "wc_purchase",
        wc_order_id: params.wcOrderId,
        purchased_at: now,
        enrolled_at: now,
      },
      { onConflict: "user_id,career_path_id" },
    );

  if (pathEnrollError) {
    console.error(
      "[Webhook] Career path enrollment failed:",
      pathEnrollError.message,
    );
    return {
      success: false,
      pathSlug: params.pathProduct.career_path_slug,
      pathTitle: params.lineItemName,
      error: pathEnrollError.message,
    };
  }

  const { data: existingCourseEnrollment } = await admin
    .from("enrollments")
    .select("id")
    .eq("user_id", params.userId)
    .eq("course_slug", courseMeta.course_slug)
    .neq("status", "cancelled")
    .maybeSingle();

  if (!existingCourseEnrollment) {
    const enrollmentPayload: EnrollmentInsert = {
      user_id: params.userId,
      course_slug: courseMeta.course_slug,
      course_id: courseMeta.course_id,
      course_title: courseMeta.course_title,
      course_image: courseMeta.course_image,
      course_category: courseMeta.course_category,
      instructor_name: courseMeta.instructor_name,
      status: "active",
      enrolled_at: now,
      source: "wc_purchase",
      wc_order_id: params.wcOrderId,
    };

    const { error: enrollError } = await admin
      .from("enrollments")
      .insert(enrollmentPayload);

    if (enrollError) {
      console.error(
        "[Webhook] Career path first course enrollment failed:",
        enrollError.message,
      );
      return {
        success: false,
        pathSlug: params.pathProduct.career_path_slug,
        pathTitle: params.lineItemName,
        error: enrollError.message,
      };
    }
  }

  const { error: orderError } = await admin.from("orders").upsert(
    {
      wc_order_id: params.wcOrderId,
      user_id: params.userId,
      total_amount: params.orderTotal,
      status: "completed",
    },
    { onConflict: "wc_order_id" },
  );

  if (orderError) {
    console.warn("[Webhook] Career path order record failed:", orderError.message);
  }

  return {
    success: true,
    pathSlug: params.pathProduct.career_path_slug,
    pathTitle: params.lineItemName,
    firstCourseSlug: courseMeta.course_slug,
    firstCourseTitle: courseMeta.course_title,
  };
}
