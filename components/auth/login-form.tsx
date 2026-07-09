"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { safeRedirectTarget } from "@/lib/auth/app-url";
import { clearStaleSupabaseAuthCookies } from "@/lib/supabase/auth-cookies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

interface LoginFormProps {
  callbackError?: string;
}

function mapSignInError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("email not confirmed")) {
    return "E-posta adresinizi henüz doğrulamadınız. Gelen kutunuzdaki bağlantıya tıklayın.";
  }
  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid credentials")
  ) {
    return "E-posta veya parola hatalı. Kayıt sonrası doğrulama mailine tıkladıysanız aynı parolayı kullanın; gerekirse parola sıfırlayın.";
  }
  return "Giriş başarısız. Bilgilerinizi kontrol edin.";
}

export function LoginForm({ callbackError }: LoginFormProps) {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectTarget(searchParams.get("redirect"));
  const [error, setError] = useState<string | null>(callbackError ?? null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      setError("Geçerli e-posta ve parola girin.");
      setPending(false);
      return;
    }

    try {
      clearStaleSupabaseAuthCookies();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        ok?: boolean;
      } | null;

      if (!response.ok || !payload?.ok) {
        setError(mapSignInError(payload?.error ?? "Giriş başarısız."));
        setPending(false);
        return;
      }

      window.location.assign(redirectTo);
    } catch {
      setError("Giriş sırasında beklenmeyen bir hata oluştu.");
      setPending(false);
    }
  }

  return (
    <Card className="border-primary-100 shadow-lg">
      <CardHeader>
        <CardTitle className="text-primary-900">Hoş Geldiniz</CardTitle>
        <CardDescription>
          Hesabınıza giriş yaparak eğitimlerinize devam edin. thorius.com.tr
          üyesiyseniz aynı e-postayı kullanın; eski kurslarınız otomatik
          senkronlanır.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} data-no-pending-cursor="true">
        <CardContent className="space-y-4">
          {error ? (
            <p
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ornek@sirket.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Parola</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" variant="gold" className="w-full" disabled={pending}>
            {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </CardContent>
        <CardFooter className="flex-col gap-0">
          <p className="text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <Link
              href={`/kayit?redirect=${encodeURIComponent(redirectTo)}`}
              className="font-medium text-primary-700 hover:underline"
            >
              Üye olun
            </Link>
          </p>
          <ForgotPasswordForm />
        </CardFooter>
      </form>
    </Card>
  );
}
