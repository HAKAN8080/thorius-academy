import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Giriş Yap | Thorius Academy",
};

interface GirisPageProps {
  searchParams: { error?: string };
}

export default function GirisPage({ searchParams }: GirisPageProps) {
  return <LoginForm callbackError={searchParams.error} />;
}
