import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/profile/ensure-profile";
import { syncLegacyUserData } from "@/lib/tutor/sync-legacy-user-data";
import { TutorPanelShell } from "@/components/panel/tutor-panel-shell";
import { getPanelShellContext } from "@/lib/panel/panel-shell-context";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/giris");
  }

  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : null;

  try {
    await ensureUserProfile(user.id, {
      email: user.email,
      fullName: metadataName,
      wpUserId:
        typeof user.user_metadata?.wp_user_id === "number"
          ? user.user_metadata.wp_user_id
          : null,
    });
  } catch (error) {
    console.error("[Profile] ensure failed:", error);
  }

  if (user.email) {
    try {
      await syncLegacyUserData(user.id, user.email);
    } catch (error) {
      console.error("[Legacy Sync] Panel sync failed:", error);
    }
  }

  const shell = await getPanelShellContext();

  return (
    <TutorPanelShell
      userEmail={shell.userEmail}
      userName={shell.userName}
      avatarUrl={shell.avatarUrl}
      isInstructor={shell.isInstructor}
    >
      {children}
    </TutorPanelShell>
  );
}
