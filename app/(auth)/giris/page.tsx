import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Giriş Yap | Thorius Academy",
};

export default function GirisPage() {
  return <LoginForm />;
}
