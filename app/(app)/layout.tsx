import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { syncLegacyUserData } from "@/lib/tutor/sync-legacy-user-data";
import { TutorPanelShell } from "@/components/panel/tutor-panel-shell";
import { getPanelShellContext } from "@/lib/panel/panel-shell-context";

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
