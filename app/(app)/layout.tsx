import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { getInstructorAccess } from "@/lib/instructor/access";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ViewModeSwitch } from "@/components/layout/view-mode-switch";
import { PanelNavLinks } from "@/components/layout/panel-nav-links";

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

  const access = await getInstructorAccess();

  return (
    <div className="min-h-screen bg-primary-50/30">
      <header className="border-b border-primary-100 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo variant="compact" />
            <span className="hidden text-sm font-medium text-primary-500 sm:inline">
              Panel
            </span>
            <nav className="hidden items-center gap-4 sm:flex">
              <PanelNavLinks />
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ViewModeSwitch
              isInstructor={access.isInstructor}
              className="hidden sm:inline-flex"
            />
            <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Çıkış Yap
            </Button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
