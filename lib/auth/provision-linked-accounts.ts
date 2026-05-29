import { provisionCoachingAccount } from "@/lib/coaching/provision-coaching-account";
import { syncUserToWpOnSignup } from "@/lib/tutor/sync-user-to-wp";

export interface ProvisionLinkedAccountsParams {
  email: string;
  fullName?: string | null;
  password: string;
}

export interface ProvisionLinkedAccountsResult {
  wp: Awaited<ReturnType<typeof syncUserToWpOnSignup>>;
  coaching: Awaited<ReturnType<typeof provisionCoachingAccount>>;
}

export async function provisionLinkedAccounts(
  params: ProvisionLinkedAccountsParams,
): Promise<ProvisionLinkedAccountsResult> {
  const [wp, coaching] = await Promise.all([
    syncUserToWpOnSignup(params),
    provisionCoachingAccount(params),
  ]);

  if (!wp.success && !wp.skipped) {
    console.warn("[Linked Accounts] WP provision failed:", wp.error);
  }

  if (!coaching.success && !coaching.skipped) {
    console.warn("[Linked Accounts] Coaching provision failed:", coaching.error);
  }

  return { wp, coaching };
}
