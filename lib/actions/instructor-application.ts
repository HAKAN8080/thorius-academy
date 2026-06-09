"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sendInstructorApplicationEmail } from "@/lib/email/send-instructor-application";
import { getInstructorAccess } from "@/lib/instructor/access";

export type InstructorApplicationState = {
  success?: boolean;
  error?: string;
  message?: string;
};

export interface InstructorApplicationStatus {
  hasPending: boolean;
  latestStatus: "pending" | "approved" | "rejected" | null;
  createdAt: string | null;
}

export async function getInstructorApplicationStatus(): Promise<InstructorApplicationStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { hasPending: false, latestStatus: null, createdAt: null };
  }

  const { data } = await supabase
    .from("instructor_applications")
    .select("status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    hasPending: data?.status === "pending",
    latestStatus: (data?.status as InstructorApplicationStatus["latestStatus"]) ?? null,
    createdAt: data?.created_at ?? null,
  };
}

export async function submitInstructorApplication(
  _prev: InstructorApplicationState,
  formData: FormData,
): Promise<InstructorApplicationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Giriş yapmalısınız" };
  }

  const access = await getInstructorAccess();
  if (access.isInstructor) {
    return { error: "Zaten eğitmen hesabınız bulunuyor." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const expertise = String(formData.get("expertise") ?? "").trim();
  const motivation = String(formData.get("motivation") ?? "").trim();
  const sampleCourseUrl = String(formData.get("sample_course_url") ?? "").trim();

  if (fullName.length < 2) {
    return { error: "Ad soyad en az 2 karakter olmalıdır" };
  }

  if (expertise.length < 5) {
    return { error: "Uzmanlık alanınızı biraz daha detaylandırın" };
  }

  if (motivation.length < 20) {
    return { error: "Motivasyon metni en az 20 karakter olmalıdır" };
  }

  if (sampleCourseUrl && !/^https?:\/\//i.test(sampleCourseUrl)) {
    return { error: "Örnek içerik linki geçerli bir URL olmalıdır" };
  }

  const admin = getSupabaseAdmin();

  const { data: pending } = await admin
    .from("instructor_applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (pending?.id) {
    return {
      error: "Bekleyen bir başvurunuz zaten var. Onay sürecini tamamlayın.",
    };
  }

  const { data: inserted, error } = await admin
    .from("instructor_applications")
    .insert({
      user_id: user.id,
      email: user.email,
      full_name: fullName,
      phone: phone || null,
      expertise,
      motivation,
      sample_course_url: sampleCourseUrl || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[Instructor Application] Insert failed:", error?.message);
    return { error: "Başvuru kaydedilemedi. Lütfen tekrar deneyin." };
  }

  await sendInstructorApplicationEmail({
    applicantName: fullName,
    applicantEmail: user.email,
    phone: phone || null,
    expertise,
    motivation,
    sampleCourseUrl: sampleCourseUrl || null,
    applicationId: inserted.id,
  });

  revalidatePath("/panel/egitmen-basvuru");

  return {
    success: true,
    message:
      "Başvurunuz alındı. Ekibimiz inceledikten sonra size e-posta ile dönüş yapacaktır.",
  };
}
