import {
  createPasswordRenewalLink,
  ensureCampaignUser,
  markMembershipRenewalSent,
} from "@/lib/campaign/membership-renewal-user";
import { pickMembershipRenewalPromoCourses } from "@/lib/campaign/pick-promo-courses";
import { sendMembershipRenewalEmail } from "@/lib/campaign/send-membership-renewal-email";
import { fetchWpMembersPage } from "@/lib/tutor/fetch-wp-members";

export interface MembershipRenewalBatchOptions {
  offset: number;
  limit: number;
  dryRun?: boolean;
  forceResend?: boolean;
}

export interface MembershipRenewalBatchResult {
  success: boolean;
  dryRun: boolean;
  offset: number;
  limit: number;
  totalMembers: number;
  hasMore: boolean;
  processed: number;
  sent: number;
  skippedAlreadySent: number;
  failed: number;
  promoCourses: string[];
  details: Array<{
    email: string;
    status: "sent" | "skipped" | "failed" | "dry_run";
    reason?: string;
  }>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runMembershipRenewalBatch(
  options: MembershipRenewalBatchOptions,
): Promise<MembershipRenewalBatchResult> {
  const dryRun = options.dryRun === true;
  const forceResend = options.forceResend === true;

  const memberPage = await fetchWpMembersPage({
    offset: options.offset,
    limit: options.limit,
  });

  if (!memberPage) {
    return {
      success: false,
      dryRun,
      offset: options.offset,
      limit: options.limit,
      totalMembers: 0,
      hasMore: false,
      processed: 0,
      sent: 0,
      skippedAlreadySent: 0,
      failed: 0,
      promoCourses: [],
      details: [],
    };
  }

  const promoCourses = await pickMembershipRenewalPromoCourses();
  const details: MembershipRenewalBatchResult["details"] = [];
  let sent = 0;
  let skippedAlreadySent = 0;
  let failed = 0;

  for (const member of memberPage.members) {
    const email = member.email.trim().toLowerCase();
    if (!email) {
      failed += 1;
      details.push({ email: "", status: "failed", reason: "missing_email" });
      continue;
    }

    const ensured = await ensureCampaignUser({
      email,
      fullName: member.full_name,
    });

    if (!ensured) {
      failed += 1;
      details.push({ email, status: "failed", reason: "user_ensure_failed" });
      continue;
    }

    if (ensured.alreadySent && !forceResend) {
      skippedAlreadySent += 1;
      details.push({ email, status: "skipped", reason: "already_sent" });
      continue;
    }

    const renewalLink = await createPasswordRenewalLink(email);
    if (!renewalLink) {
      failed += 1;
      details.push({ email, status: "failed", reason: "recovery_link_failed" });
      continue;
    }

    if (dryRun) {
      details.push({ email, status: "dry_run" });
      continue;
    }

    const emailSent = await sendMembershipRenewalEmail({
      email,
      fullName: member.full_name,
      passwordRenewalLink: renewalLink,
      promoCourses,
    });

    if (!emailSent) {
      failed += 1;
      details.push({ email, status: "failed", reason: "email_send_failed" });
      continue;
    }

    await markMembershipRenewalSent(ensured.userId);
    sent += 1;
    details.push({ email, status: "sent" });

    await sleep(120);
  }

  return {
    success: true,
    dryRun,
    offset: memberPage.offset,
    limit: memberPage.limit,
    totalMembers: memberPage.total,
    hasMore: memberPage.has_more,
    processed: memberPage.members.length,
    sent,
    skippedAlreadySent,
    failed,
    promoCourses: promoCourses.map((course) => course.slug),
    details,
  };
}
