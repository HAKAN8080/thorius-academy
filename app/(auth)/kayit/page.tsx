import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Üye Ol | Thorius Academy",
};

export default function KayitPage() {
  return <RegisterForm />;
}
