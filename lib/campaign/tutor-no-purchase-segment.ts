import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface TutorNoPurchaseCourse {
  slug: string;
  title: string;
  progress: number;
}

export interface TutorNoPurchaseMember {
  user_id: string;
  email: string;
  full_name: string | null;
  wp_user_id: number | null;
  tutor_courses: TutorNoPurchaseCourse[];
  tutor_legacy_synced_at: string | null;
  membership_renewal_campaign_at: string | null;
  last_sign_in_at: string | null;
}

export interface TutorNoPurchaseSegmentResult {
  segment_count: number;
  members: TutorNoPurchaseMember[];
  stats: {
    with_campaign_email_sent: number;
    with_last_sign_in: number;
    not_yet_migrated_to_supabase: number | null;
    wp_tutor_member_total: number | null;
  };
}

interface EnrollmentRow {
  user_id: string;
  course_slug: string;
  course_title: string;
  progress: number;
  source: string | null;
  wc_order_id: number | null;
  status: string;
}

function isWcPurchase(row: EnrollmentRow): boolean {
  return row.source === "wc_purchase" || row.wc_order_id != null;
}

function isTutorLegacy(row: EnrollmentRow): boolean {
  return row.source === "tutor_legacy";
}

async function listAllAuthUsers(): Promise<
  Map<
    string,
    {
      email: string;
      tutor_legacy_synced_at: string | null;
      membership_renewal_campaign_at: string | null;
      last_sign_in_at: string | null;
      full_name: string | null;
    }
  >
> {
  const admin = getSupabaseAdmin();
  const map = new Map<
    string,
    {
      email: string;
      tutor_legacy_synced_at: string | null;
      membership_renewal_campaign_at: string | null;
      last_sign_in_at: string | null;
      full_name: string | null;
    }
  >();

  let page = 1;
  while (page <= 50) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw new Error(`auth listUsers failed: ${error.message}`);
    }

    for (const user of data.users) {
      const meta = user.user_metadata ?? {};
      map.set(user.id, {
        email: user.email?.trim().toLowerCase() ?? "",
        tutor_legacy_synced_at:
          typeof meta.tutor_legacy_synced_at === "string"
            ? meta.tutor_legacy_synced_at
            : null,
        membership_renewal_campaign_at:
          typeof meta.membership_renewal_campaign_at === "string"
            ? meta.membership_renewal_campaign_at
            : null,
        last_sign_in_at: user.last_sign_in_at ?? null,
        full_name:
          typeof meta.full_name === "string" ? meta.full_name.trim() : null,
      });
    }

    if (data.users.length < 200) break;
    page += 1;
  }

  return map;
}

export async function fetchTutorNoPurchaseSegment(options?: {
  wpTutorMemberTotal?: number | null;
}): Promise<TutorNoPurchaseSegmentResult> {
  const admin = getSupabaseAdmin();

  const { data: enrollmentRows, error: enrollmentError } = await admin
    .from("enrollments")
    .select(
      "user_id, course_slug, course_title, progress, source, wc_order_id, status",
    )
    .neq("status", "cancelled");

  if (enrollmentError) {
    throw new Error(`enrollments query failed: ${enrollmentError.message}`);
  }

  const rows = (enrollmentRows ?? []) as EnrollmentRow[];
  const byUser = new Map<
    string,
    { hasWc: boolean; tutorCourses: TutorNoPurchaseCourse[] }
  >();

  for (const row of rows) {
    if (!row.user_id) continue;

    let entry = byUser.get(row.user_id);
    if (!entry) {
      entry = { hasWc: false, tutorCourses: [] };
      byUser.set(row.user_id, entry);
    }

    if (isWcPurchase(row)) {
      entry.hasWc = true;
    }

    if (isTutorLegacy(row)) {
      entry.tutorCourses.push({
        slug: row.course_slug,
        title: row.course_title,
        progress: row.progress ?? 0,
      });
    }
  }

  const segmentUserIds = Array.from(byUser.entries())
    .filter(([, entry]) => entry.tutorCourses.length > 0 && !entry.hasWc)
    .map(([userId]) => userId);

  const authUsers = await listAllAuthUsers();

  const profileWpIds = new Map<string, number | null>();
  if (segmentUserIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, wp_user_id")
      .in("id", segmentUserIds);

    for (const profile of profiles ?? []) {
      profileWpIds.set(
        profile.id,
        profile.wp_user_id != null ? Number(profile.wp_user_id) : null,
      );
      if (profile.full_name && authUsers.has(profile.id)) {
        const auth = authUsers.get(profile.id)!;
        if (!auth.full_name) {
          auth.full_name = profile.full_name;
        }
      }
    }
  }

  const members: TutorNoPurchaseMember[] = [];

  for (const userId of segmentUserIds) {
    const entry = byUser.get(userId)!;
    const auth = authUsers.get(userId);

    members.push({
      user_id: userId,
      email: auth?.email ?? "",
      full_name: auth?.full_name ?? null,
      wp_user_id: profileWpIds.get(userId) ?? null,
      tutor_courses: entry.tutorCourses.sort((a, b) =>
        a.slug.localeCompare(b.slug, "tr"),
      ),
      tutor_legacy_synced_at: auth?.tutor_legacy_synced_at ?? null,
      membership_renewal_campaign_at:
        auth?.membership_renewal_campaign_at ?? null,
      last_sign_in_at: auth?.last_sign_in_at ?? null,
    });
  }

  members.sort((a, b) => a.email.localeCompare(b.email, "tr"));

  const wpTotal = options?.wpTutorMemberTotal ?? null;

  return {
    segment_count: members.length,
    members,
    stats: {
      with_campaign_email_sent: members.filter(
        (m) => m.membership_renewal_campaign_at,
      ).length,
      with_last_sign_in: members.filter((m) => m.last_sign_in_at).length,
      not_yet_migrated_to_supabase:
        wpTotal != null ? Math.max(0, wpTotal - members.length) : null,
      wp_tutor_member_total: wpTotal,
    },
  };
}
