import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { withCoursesCacheSlug } from "@/lib/instructor/course-cache-access";

export type Day1CheckStatus = "pass" | "fail" | "warn";

export interface Day1CheckItem {
  id: string;
  label: string;
  status: Day1CheckStatus;
  detail?: string;
}

export interface Day1CheckReport {
  ok: boolean;
  checkedAt: string;
  summary: {
    pass: number;
    warn: number;
    fail: number;
  };
  checks: Day1CheckItem[];
  manualSteps: string[];
}

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET",
  "TUTOR_CONSUMER_KEY",
  "TUTOR_CONSUMER_SECRET",
  "DEFAULT_INSTRUCTOR_WP_ID",
] as const;

const OPTIONAL_ENV = ["WP_WEBHOOK_SECRET", "INSTRUCTOR_EMAILS"] as const;

const INSTRUCTOR_ROUTES = [
  "/instructor/dashboard",
  "/instructor/courses",
  "/instructor/courses/[courseId]/basics",
  "/instructor/courses/[courseId]/curriculum",
  "/instructor/courses/[courseId]/additional",
] as const;

function push(
  checks: Day1CheckItem[],
  item: Day1CheckItem,
): void {
  checks.push(item);
}

async function countTable(
  table: string,
): Promise<{ count: number | null; error: string | null }> {
  try {
    const admin = getSupabaseAdmin();
    const { count, error } = await admin
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      return { count: null, error: error.message };
    }

    return { count: count ?? 0, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { count: null, error: message };
  }
}

async function testCourseWrite(instructorWpId: number): Promise<Day1CheckItem> {
  const admin = getSupabaseAdmin();
  const testWpCourseId = -999_999_991;

  await admin
    .from("courses_cache")
    .delete()
    .eq("wp_course_id", testWpCourseId);

  const { data, error } = await admin
    .from("courses_cache")
    .insert(
      withCoursesCacheSlug(
        {
          wp_course_id: testWpCourseId,
          instructor_wp_user_id: instructorWpId,
          title: "Day1 Check Test",
          published: false,
          pricing_model: "free",
          price: 0,
          level: "Başlangıç",
          language: "Türkçe",
          visibility: "public",
        },
        "day1-check-test",
      ),
    )
    .select("id")
    .single();

  if (error || !data) {
    return {
      id: "courses_cache_write",
      label: "courses_cache yazma izni (Yeni Kurs)",
      status: "fail",
      detail: error?.message ?? "Insert başarısız",
    };
  }

  await admin.from("instructor_course_stats").upsert(
    {
      wp_course_id: testWpCourseId,
      course_slug: "day1-check-test",
      instructor_wp_user_id: instructorWpId,
      title: "Day1 Check Test",
      status: "draft",
      enrollment_count: 0,
      rating_avg: 0,
      rating_count: 0,
    },
    { onConflict: "wp_course_id" },
  );

  await admin.from("courses_cache").delete().eq("wp_course_id", testWpCourseId);
  await admin
    .from("instructor_course_stats")
    .delete()
    .eq("wp_course_id", testWpCourseId);

  return {
    id: "courses_cache_write",
    label: "courses_cache yazma izni (Yeni Kurs)",
    status: "pass",
    detail: "Insert + delete testi başarılı",
  };
}

export async function runDay1InstructorCheck(): Promise<Day1CheckReport> {
  const checks: Day1CheckItem[] = [];

  for (const key of REQUIRED_ENV) {
    push(checks, {
      id: `env_${key}`,
      label: `Env: ${key}`,
      status: process.env[key] ? "pass" : "fail",
      detail: process.env[key] ? "Tanımlı" : "Eksik",
    });
  }

  for (const key of OPTIONAL_ENV) {
    push(checks, {
      id: `env_${key}`,
      label: `Env: ${key}`,
      status: process.env[key] ? "pass" : "warn",
      detail: process.env[key] ? "Tanımlı" : "Opsiyonel — legacy sync için önerilir",
    });
  }

  push(checks, {
    id: "routes",
    label: "Eğitmen paneli rotaları",
    status: "pass",
    detail: INSTRUCTOR_ROUTES.join(", "),
  });

  const tables = [
    "instructors",
    "instructor_course_stats",
    "courses_cache",
    "sections",
    "lessons",
  ] as const;

  for (const table of tables) {
    const { count, error } = await countTable(table);
    push(checks, {
      id: `table_${table}`,
      label: `Tablo: ${table}`,
      status: error ? "fail" : "pass",
      detail: error ?? `${count ?? 0} kayıt`,
    });
  }

  const defaultInstructorId = parseInt(
    process.env.DEFAULT_INSTRUCTOR_WP_ID ?? "277",
    10,
  );

  if (Number.isFinite(defaultInstructorId) && defaultInstructorId > 0) {
    try {
      checks.push(await testCourseWrite(defaultInstructorId));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      push(checks, {
        id: "courses_cache_write",
        label: "courses_cache yazma izni (Yeni Kurs)",
        status: "fail",
        detail: message,
      });
    }
  } else {
    push(checks, {
      id: "courses_cache_write",
      label: "courses_cache yazma izni (Yeni Kurs)",
      status: "fail",
      detail: "DEFAULT_INSTRUCTOR_WP_ID geçersiz",
    });
  }

  const pass = checks.filter((c) => c.status === "pass").length;
  const warn = checks.filter((c) => c.status === "warn").length;
  const fail = checks.filter((c) => c.status === "fail").length;

  return {
    ok: fail === 0,
    checkedAt: new Date().toISOString(),
    summary: { pass, warn, fail },
    checks,
    manualSteps: [
      "Panele giriş yap → sağ üstten Yeni Kurs",
      "Temel Bilgiler: başlık kaydet → Müfredat adımına geç",
      "Müfredat: bölüm ekle → ders ekle → kaydet → ders sil",
      "Ek Bilgiler: metin kaydet",
      "/instructor/courses listesinde taslak kursu gör",
      "Prod SQL: enrollments + lesson_progress migration uygulandı mı kontrol et",
    ],
  };
}
