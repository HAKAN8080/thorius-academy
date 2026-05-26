import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ViewModeSwitch } from "@/components/layout/view-mode-switch";
import { getInstructorPortalUrl } from "@/lib/config/portal-urls";

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
              <Link
                href="/panel/kurslarim"
                className="text-sm font-medium text-primary-700 hover:text-primary-900"
              >
                Kurslarım
              </Link>
              <Link
                href={getInstructorPortalUrl()}
                className="text-sm font-medium text-primary-700 hover:text-primary-900"
              >
                Eğitmen görünümü
              </Link>
              <Link
                href="/"
                className="text-sm text-primary-600 hover:text-primary-900"
              >
                Siteye Dön
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ViewModeSwitch className="hidden sm:inline-flex" />
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
