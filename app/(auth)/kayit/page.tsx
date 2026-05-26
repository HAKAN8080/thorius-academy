import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Üye Ol | Thorius Academy",
};

export default function KayitPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-primary-100 bg-white p-8 text-center text-muted-foreground shadow-lg">
          Yükleniyor...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
