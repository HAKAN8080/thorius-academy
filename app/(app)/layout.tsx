import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

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
            <Link href="/panel" className="font-bold text-primary-900">
              THORIUS<span className="text-accent-500">•</span> Panel
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
              <Link
                href="/panel/kurslarim"
                className="text-sm font-medium text-primary-700 hover:text-primary-900"
              >
                Kurslarım
              </Link>
              <Link
                href="/"
                className="text-sm text-primary-600 hover:text-primary-900"
              >
                Siteye Dön
              </Link>
            </nav>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Çıkış Yap
            </Button>
          </form>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
