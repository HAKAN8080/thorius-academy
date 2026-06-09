import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/app-url";

export const metadata: Metadata = {
  title: "Yeni Parola",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function YeniParolaPage({ searchParams }: Props) {
  const params = await searchParams;
  const redirectTo = safeNextPath(params.redirect ?? "/panel/kurslarim");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/giris?redirect=${encodeURIComponent("/yeni-parola")}`);
  }

  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md">
        <UpdatePasswordForm redirectTo={redirectTo} />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          E-postadaki bağlantı süresi dolmuşsa{" "}
          <Link href="/giris" className="text-primary-700 underline">
            giriş sayfasından
          </Link>{" "}
          tekrar sıfırlama isteyin.
        </p>
      </div>
    </Container>
  );
}
