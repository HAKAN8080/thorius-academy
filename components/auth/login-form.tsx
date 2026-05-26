"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, type AuthActionState } from "@/lib/actions/auth";
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

const initialState: AuthActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gold" className="w-full" disabled={pending}>
      {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
    </Button>
  );
}

interface LoginFormProps {
  callbackError?: string;
}

export function LoginForm({ callbackError }: LoginFormProps) {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/panel";
  const [state, formAction] = useFormState(signIn, initialState);

  const displayError = state.error ?? callbackError;

  return (
    <Card className="border-primary-100 shadow-lg">
      <CardHeader>
        <CardTitle className="text-primary-900">Hoş Geldiniz</CardTitle>
        <CardDescription>
          Hesabınıza giriş yaparak eğitimlerinize devam edin
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="redirect" value={redirectTo} />
        <CardContent className="space-y-4">
          {displayError && (
            <p
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {displayError}
            </p>
          )}
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
          <SubmitButton />
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
