import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Giriş Yap | Thorius Academy",
};

interface GirisPageProps {
  searchParams: { error?: string; redirect?: string };
}

export default function GirisPage({ searchParams }: GirisPageProps) {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-primary-100 bg-white p-8 text-center text-muted-foreground shadow-lg">
          Yükleniyor...
        </div>
      }
    >
      <LoginForm callbackError={searchParams.error} />
    </Suspense>
  );
}
