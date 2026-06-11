import {
  ensureWpMigrationUser,
  markWpMigrationComplete,
  sendWpMigrationInvite,
} from "@/lib/tutor/ensure-wp-migration-user";
import { fetchWpMembersPage } from "@/lib/tutor/fetch-wp-members";
import { syncLegacyUserData } from "@/lib/tutor/sync-legacy-user-data";
import { getWpSiteOrigin } from "@/lib/wordpress/wp-site-origin";

export interface WpUsersMigrationBatchOptions {
  offset: number;
  limit: number;
  dryRun?: boolean;
  force?: boolean;
  invite?: boolean;
  sleepMs?: number;
}

export interface WpUsersMigrationBatchResult {
  success: boolean;
  dryRun: boolean;
  offset: number;
  limit: number;
  totalMembers: number;
  hasMore: boolean;
  processed: number;
  created: number;
  linked: number;
  skippedAlreadyMigrated: number;
  enrollmentsImported: number;
  progressImported: number;
  invitesSent: number;
  failed: number;
  error?: string;
  details: Array<{
    email: string;
    wp_user_id: number;
    status: "migrated" | "skipped" | "failed" | "dry_run";
    created?: boolean;
    enrollments?: number;
    progress?: number;
    reason?: string;
  }>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runWpUsersMigrationBatch(
  options: WpUsersMigrationBatchOptions,
): Promise<WpUsersMigrationBatchResult> {
  const dryRun = options.dryRun === true;
  const force = options.force === true;
  const invite = options.invite === true;
  const sleepMs = options.sleepMs ?? 150;

  const memberPage = await fetchWpMembersPage({
    offset: options.offset,
    limit: options.limit,
  });

  if (!memberPage) {
    const missing: string[] = [];
    if (!process.env.WP_WEBHOOK_SECRET?.trim()) {
      missing.push("WP_WEBHOOK_SECRET (.env.local)");
    }
    if (!getWpSiteOrigin()) {
      missing.push("NEXT_PUBLIC_WP_SITE_URL veya NEXT_PUBLIC_WP_API_URL");
    }
    return {
      success: false,
      dryRun,
      offset: options.offset,
      limit: options.limit,
      totalMembers: 0,
      hasMore: false,
      processed: 0,
      created: 0,
      linked: 0,
      skippedAlreadyMigrated: 0,
      enrollmentsImported: 0,
      progressImported: 0,
      invitesSent: 0,
      failed: 0,
      details: [],
      error:
        missing.length > 0
          ? `Eksik yapılandırma: ${missing.join(", ")}`
          : "WP academy-member-list yanıt vermedi (plugin kapalı, secret uyuşmuyor veya sürüm < 1.7.0)",
    };
  }

  const details: WpUsersMigrationBatchResult["details"] = [];
  let created = 0;
  let linked = 0;
  let skippedAlreadyMigrated = 0;
  let enrollmentsImported = 0;
  let progressImported = 0;
  let invitesSent = 0;
  let failed = 0;

  for (const member of memberPage.members) {
    const email = member.email.trim().toLowerCase();
    const wpUserId = member.wp_user_id;

    if (!email || wpUserId <= 0) {
      failed += 1;
      details.push({
        email: email || "(boş)",
        wp_user_id: wpUserId,
        status: "failed",
        reason: "missing_email_or_wp_user_id",
      });
      continue;
    }

    if (dryRun) {
      details.push({
        email,
        wp_user_id: wpUserId,
        status: "dry_run",
      });
      continue;
    }

    const ensured = await ensureWpMigrationUser({
      email,
      fullName: member.full_name,
      wpUserId,
    });

    if (!ensured) {
      failed += 1;
      details.push({
        email,
        wp_user_id: wpUserId,
        status: "failed",
        reason: "user_ensure_failed",
      });
      continue;
    }

    if (ensured.created) {
      created += 1;
    } else {
      linked += 1;
    }

    if (ensured.alreadyMigrated && !force) {
      skippedAlreadyMigrated += 1;
      details.push({
        email,
        wp_user_id: wpUserId,
        status: "skipped",
        reason: "already_migrated",
      });
      continue;
    }

    const syncResult = await syncLegacyUserData(ensured.userId, email, {
      wpUserId,
      force: true,
    });

    if (
      syncResult.skipped &&
      (syncResult.reason === "no_wp_user" ||
        syncResult.reason === "user_not_found")
    ) {
      failed += 1;
      details.push({
        email,
        wp_user_id: wpUserId,
        status: "failed",
        reason: syncResult.reason,
      });
      continue;
    }

    enrollmentsImported += syncResult.importedEnrollments;
    progressImported += syncResult.updatedProgress;

    await markWpMigrationComplete(ensured.userId);

    if (invite && ensured.created) {
      const sent = await sendWpMigrationInvite(email);
      if (sent) {
        invitesSent += 1;
      }
    }

    details.push({
      email,
      wp_user_id: wpUserId,
      status: "migrated",
      created: ensured.created,
      enrollments: syncResult.importedEnrollments,
      progress: syncResult.updatedProgress,
      reason: syncResult.skipped ? syncResult.reason : undefined,
    });

    if (sleepMs > 0) {
      await sleep(sleepMs);
    }
  }

  return {
    success: true,
    dryRun,
    offset: memberPage.offset,
    limit: memberPage.limit,
    totalMembers: memberPage.total,
    hasMore: memberPage.has_more,
    processed: memberPage.members.length,
    created,
    linked,
    skippedAlreadyMigrated,
    enrollmentsImported,
    progressImported,
    invitesSent,
    failed,
    details,
  };
}
