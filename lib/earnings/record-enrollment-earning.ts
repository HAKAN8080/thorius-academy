import { getSupabaseAdmin } from "@/lib/supabase/admin";

interface RecordEnrollmentEarningInput {
  wcOrderId: number;
  wpCourseId: number;
  saleAmount: number;
  userId: string;
}

export async function recordEnrollmentEarning(
  input: RecordEnrollmentEarningInput,
): Promise<void> {
  if (input.saleAmount <= 0) {
    return;
  }

  const admin = getSupabaseAdmin();

  const { data: courseCache } = await admin
    .from("courses_cache")
    .select("id, instructor_wp_user_id")
    .eq("wp_course_id", input.wpCourseId)
    .maybeSingle();

  const instructorWpUserId = courseCache?.instructor_wp_user_id;
  if (!instructorWpUserId) {
    return;
  }

  const { data: instructor } = await admin
    .from("instructors")
    .select("revenue_share_percent")
    .eq("wp_user_id", instructorWpUserId)
    .maybeSingle();

  const sharePercent = instructor?.revenue_share_percent ?? 70;
  const instructorShare = Number(
    ((input.saleAmount * sharePercent) / 100).toFixed(2),
  );
  const thoriusShare = Number((input.saleAmount - instructorShare).toFixed(2));

  const { data: existingOrder } = await admin
    .from("orders")
    .select("id")
    .eq("wc_order_id", input.wcOrderId)
    .maybeSingle();

  let orderId = existingOrder?.id as string | undefined;

  if (!orderId) {
    const { data: orderRow, error: orderError } = await admin
      .from("orders")
      .insert({
        wc_order_id: input.wcOrderId,
        user_id: input.userId,
        total_amount: input.saleAmount,
        status: "completed",
      })
      .select("id")
      .single();

    if (orderError || !orderRow) {
      console.error("[Earnings] Order insert failed:", orderError?.message);
      return;
    }

    orderId = orderRow.id as string;
  }

  const { data: existingEarning } = await admin
    .from("earnings")
    .select("id")
    .eq("wc_order_id", input.wcOrderId)
    .eq("wp_course_id", input.wpCourseId)
    .maybeSingle();

  if (existingEarning) {
    return;
  }

  const { error: earningError } = await admin.from("earnings").insert({
    instructor_wp_user_id: instructorWpUserId,
    course_id: courseCache?.id ?? null,
    wp_course_id: input.wpCourseId,
    order_id: orderId,
    wc_order_id: input.wcOrderId,
    sale_amount: input.saleAmount,
    instructor_share: instructorShare,
    thorius_share: thoriusShare,
  });

  if (earningError) {
    console.error("[Earnings] Insert failed:", earningError.message);
  }
}
