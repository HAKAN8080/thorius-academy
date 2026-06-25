import { getAuthCallbackUrl, getAppOrigin } from "@/lib/auth/app-url";
import { fulfillCareerPathPurchase } from "@/lib/career-path/fulfill-career-path-purchase";
import { EnrollmentEmail } from "@/lib/email/templates/enrollment";
import { recordEnrollmentEarning } from "@/lib/earnings/record-enrollment-earning";
import { getResendClient, getResendFromAddress } from "@/lib/resend/client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchCourseBySlug } from "@/lib/wordpress/api";
import type { CareerPathProduct } from "@/types/career-path-product";
import type { CourseProduct } from "@/types/course-product";
import type { Database } from "@/types/database";
import type { WooCommerceOrderWebhook } from "@/types/woocommerce-webhook";

type CourseProductMapping = Pick<CourseProduct, "course_slug" | "wp_course_id">;
type CareerPathProductMapping = Pick<
  CareerPathProduct,
  | "career_path_id"
  | "career_path_slug"
  | "wc_product_id"
  | "price_normal"
  | "price_sale"
>;
type EnrollmentInsert = Database["public"]["Tables"]["enrollments"]["Insert"];

interface EnrolledCourse {
  slug: string;
  title: string;
}

export interface ProcessWcOrderResult {
  success: boolean;
  order_id: number;
  user_id?: string;
  enrolled_courses: EnrolledCourse[];
  email_sent: boolean;
  message?: string;
  warning?: string;
}

function isDuplicateEmailError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("already been registered") ||
    lower.includes("already exists") ||
    lower.includes("duplicate")
  );
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const target = email.toLowerCase();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      console.error("[Webhook] listUsers failed:", error.message);
      return null;
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === target,
    );
    if (match) return match.id;

    if (data.users.length < 200) break;
    page += 1;
  }

  return null;
}

async function getOrCreateUser(
  email: string,
  customerName: string,
  orderId: number,
): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: created, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: customerName,
        source: "wc_purchase",
        wc_order_id: orderId,
      },
    });

  if (created?.user) {
    console.log("[Webhook] New user created:", created.user.id);
    return created.user.id;
  }

  if (createError && isDuplicateEmailError(createError.message)) {
    const existingId = await findUserIdByEmail(email);
    if (existingId) {
      console.log("[Webhook] Existing user found:", existingId);
      return existingId;
    }
  }

  if (createError) {
    console.error("[Webhook] User creation failed:", createError.message);
  }

  return null;
}

async function isOrderAlreadyProcessed(orderId: number): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin();

  const [enrollmentCheck, pathEnrollmentCheck] = await Promise.all([
    supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("wc_order_id", orderId)
      .limit(1),
    supabaseAdmin
      .from("career_path_enrollments")
      .select("id")
      .eq("wc_order_id", orderId)
      .limit(1),
  ]);

  if (enrollmentCheck.error) {
    console.warn("[Webhook] wc_order_id check skipped:", enrollmentCheck.error.message);
  }

  if (pathEnrollmentCheck.error) {
    console.warn(
      "[Webhook] career path wc_order_id check skipped:",
      pathEnrollmentCheck.error.message,
    );
  }

  return (
    (enrollmentCheck.data?.length ?? 0) > 0 ||
    (pathEnrollmentCheck.data?.length ?? 0) > 0
  );
}

export async function processWooCommerceOrder(
  order: WooCommerceOrderWebhook,
): Promise<ProcessWcOrderResult> {
  const customerEmail = order.billing?.email?.trim().toLowerCase();
  const customerName =
    `${order.billing?.first_name ?? ""} ${order.billing?.last_name ?? ""}`.trim() ||
    "Misafir";

  if (!customerEmail) {
    return {
      success: false,
      order_id: order.id,
      enrolled_courses: [],
      email_sent: false,
      warning: "No customer email",
    };
  }

  if (await isOrderAlreadyProcessed(order.id)) {
    console.log("[Webhook] Order already processed:", order.id);
    return {
      success: true,
      order_id: order.id,
      enrolled_courses: [],
      email_sent: false,
      message: "Order already processed",
    };
  }

  const userId = await getOrCreateUser(customerEmail, customerName, order.id);
  if (!userId) {
    return {
      success: false,
      order_id: order.id,
      enrolled_courses: [],
      email_sent: false,
      warning: "User creation failed",
    };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const enrolledCourses: EnrolledCourse[] = [];
  const orderTotalAmount = Number.parseFloat(order.total);
  const saleAmountBase = Number.isFinite(orderTotalAmount) ? orderTotalAmount : 0;
  const mappableLineItems = (order.line_items ?? []).length || 1;
  const saleAmountPerCourse = saleAmountBase / mappableLineItems;

  for (const item of order.line_items ?? []) {
    const wcProductId = item.product_id;

    const { data: pathProductData, error: pathProductError } =
      await supabaseAdmin
        .from("career_path_products")
        .select(
          "career_path_id, career_path_slug, wc_product_id, price_normal, price_sale",
        )
        .eq("wc_product_id", wcProductId)
        .eq("is_active", true)
        .maybeSingle();

    const pathProduct = pathProductData as CareerPathProductMapping | null;

    if (!pathProductError && pathProduct) {
      const fulfillment = await fulfillCareerPathPurchase({
        userId,
        wcOrderId: order.id,
        pathProduct: pathProduct as CareerPathProduct,
        orderTotal: saleAmountBase,
        lineItemName: item.name,
      });

      if (fulfillment.success && fulfillment.firstCourseSlug) {
        enrolledCourses.push({
          slug: fulfillment.firstCourseSlug,
          title: fulfillment.firstCourseTitle ?? item.name,
        });
        console.log(
          `[Webhook] Career path enrolled: ${fulfillment.pathSlug} → ${fulfillment.firstCourseSlug}`,
        );
      } else if (!fulfillment.success) {
        console.error(
          `[Webhook] Career path fulfillment failed: ${fulfillment.error}`,
        );
      }
      continue;
    }

    const { data: courseProductData, error: productError } = await supabaseAdmin
      .from("course_products")
      .select("course_slug, wp_course_id")
      .eq("wc_product_id", wcProductId)
      .eq("is_active", true)
      .maybeSingle();

    const courseProduct = courseProductData as CourseProductMapping | null;

    if (productError || !courseProduct) {
      console.warn(
        `[Webhook] No course mapping for WC product ${wcProductId}`,
      );
      continue;
    }

    const courseSlug = courseProduct.course_slug;

    const { data: existingEnrollment } = await supabaseAdmin
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_slug", courseSlug)
      .neq("status", "cancelled")
      .maybeSingle();

    if (existingEnrollment) {
      console.log(`[Webhook] Already enrolled: ${courseSlug}`);
      enrolledCourses.push({ slug: courseSlug, title: item.name });
      continue;
    }

    const course = await fetchCourseBySlug(courseSlug);

    const enrollmentPayload: EnrollmentInsert = {
      user_id: userId,
      course_slug: courseSlug,
      course_id: courseProduct.wp_course_id,
      course_title: course?.title ?? item.name,
      course_image: course?.featuredImage ?? null,
      course_category: course?.categories[0]?.name ?? null,
      instructor_name: course?.instructor?.name ?? null,
      status: "active",
      enrolled_at: new Date().toISOString(),
      source: "wc_purchase",
      wc_order_id: order.id,
    };

    const { error: enrollError } = await supabaseAdmin
      .from("enrollments")
      .insert(enrollmentPayload);

    if (enrollError) {
      console.error("[Webhook] Enrollment failed:", enrollError.message);
      continue;
    }

    await recordEnrollmentEarning({
      wcOrderId: order.id,
      wpCourseId: courseProduct.wp_course_id,
      saleAmount: saleAmountPerCourse,
      userId,
    });

    enrolledCourses.push({ slug: courseSlug, title: course?.title ?? item.name });
    console.log(`[Webhook] Enrolled: ${courseSlug}`);
  }

  if (enrolledCourses.length === 0) {
    return {
      success: true,
      order_id: order.id,
      user_id: userId,
      enrolled_courses: [],
      email_sent: false,
      warning: "No courses to enroll",
    };
  }

  const firstCourseSlug = enrolledCourses[0].slug;
  const redirectTo = getAuthCallbackUrl(`/panel/kurslarim/${firstCourseSlug}`);

  const { data: magicLinkData, error: magicLinkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: customerEmail,
      options: { redirectTo },
    });

  if (magicLinkError) {
    console.error("[Webhook] Magic link error:", magicLinkError.message);
  }

  const magicLink =
    magicLinkData?.properties?.action_link ??
    `${getAppOrigin()}/giris?redirect=${encodeURIComponent(`/panel/kurslarim/${firstCourseSlug}`)}`;

  const courseTitle = enrolledCourses.map((course) => course.title).join(", ");
  const parsedTotal = Number.parseFloat(order.total);
  const orderTotal = Number.isFinite(parsedTotal)
    ? `₺${parsedTotal.toLocaleString("tr-TR")}`
    : order.total;

  let emailSent = false;

  try {
    const resend = getResendClient();
    const { error: emailError } = await resend.emails.send({
      from: getResendFromAddress(),
      to: customerEmail,
      subject: `🎓 Kursunuz Hazır - ${courseTitle}`,
      react: EnrollmentEmail({
        customerName,
        courseTitle,
        magicLink,
        orderTotal,
      }),
    });

    if (emailError) {
      console.error("[Webhook] Email send failed:", emailError.message);
    } else {
      emailSent = true;
      console.log("[Webhook] Email sent to:", customerEmail);
    }
  } catch (emailError) {
    console.error("[Webhook] Email send failed:", emailError);
  }

  return {
    success: true,
    order_id: order.id,
    user_id: userId,
    enrolled_courses: enrolledCourses,
    email_sent: emailSent,
  };
}
