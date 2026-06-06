"use client";

import type { ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import {
  resendVerificationEmail,
  signUp,
  type AuthActionState,
} from "@/lib/actions/auth";
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

const initialState: AuthActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gold" className="w-full" disabled={pending}>
      {pending ? "Kayıt oluşturuluyor..." : "Hesap Oluştur"}
    </Button>
  );
}

function ResendButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      className="rounded-xl"
      disabled={pending}
    >
      {pending ? "Gönderiliyor..." : "Tekrar gönder"}
    </Button>
  );
}

function RegisterSuccess({
  email,
  couponCode,
  redirectTo,
  resendState,
  resendForm,
}: {
  email: string;
  couponCode?: string;
  redirectTo: string;
  resendState: AuthActionState;
  resendForm: ReactNode;
}) {
  const displayCoupon = couponCode ?? resendState.couponCode;
  return (
    <Card className="border-primary-100 shadow-lg">
      <CardContent className="space-y-6 pt-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2
              className="h-10 w-10 text-emerald-600"
              aria-hidden="true"
            />
          </div>
          <h2 className="mt-4 text-xl font-bold text-primary-900">
            Hesabınız oluşturuldu!
          </h2>
          <div className="mt-4 max-w-sm space-y-3 text-sm leading-relaxed text-primary-700">
            <p>
              <span aria-hidden="true">📧 </span>
              <strong>{email}</strong> adresine doğrulama linki gönderdik.
            </p>
            <p>
              Tek e-postada doğrulama linki ve %20 indirim kuponunuz var.
              Linke tıkladığınızda hesabınıza otomatik giriş yapılacak.
            </p>
            {displayCoupon && (
              <div className="rounded-xl border-2 border-accent-500 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                  Kupon kodunuz
                </p>
                <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-primary-900">
                  {displayCoupon}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  E-posta gelmese bile ödeme adımında bu kodu kullanabilirsiniz.
                </p>
              </div>
            )}
            <p className="text-muted-foreground">
              E-posta gelmiyor mu? Spam klasörünüzü kontrol edin.
            </p>
          </div>
        </div>

        {resendState.error && (
          <p
            className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive"
            role="alert"
          >
            {resendState.error}
          </p>
        )}
        {resendState.successMessage && resendState.success && (
          <p
            className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-800"
            role="status"
          >
            {resendState.successMessage}
          </p>
        )}

        {resendForm}

        <p className="text-center text-sm text-muted-foreground">
          <Link
            href={`/giris?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-medium text-primary-700 hover:underline"
          >
            Giriş sayfasına dön
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export function RegisterForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/panel";
  const [state, formAction] = useFormState(signUp, initialState);
  const [resendState, resendAction] = useFormState(
    resendVerificationEmail,
    initialState
  );

  const registeredEmail = state.registeredEmail ?? resendState.registeredEmail;

  if (state.success && registeredEmail) {
    return (
      <RegisterSuccess
        email={registeredEmail}
        couponCode={state.couponCode}
        redirectTo={redirectTo}
        resendState={resendState}
        resendForm={
          <form
            action={resendAction}
            className="flex flex-col items-center gap-3"
          >
            <input type="hidden" name="email" value={registeredEmail} />
            <input type="hidden" name="redirect" value={redirectTo} />
            <ResendButton />
          </form>
        }
      />
    );
  }

  return (
    <Card className="border-primary-100 shadow-lg">
      <CardHeader>
        <CardTitle className="text-primary-900">Üye Olun</CardTitle>
        <CardDescription>
          Premium perakende eğitim dünyasına adım atın — ilk üyeliğe %20 indirim
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="redirect" value={redirectTo} />
        <CardContent className="space-y-4">
          {state.error && (
            <p
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {state.error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">Ad Soyad</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Adınız Soyadınız"
              required
              autoComplete="name"
            />
          </div>
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
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-start gap-2">
            <input
              id="kvkk"
              name="kvkk"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-primary-300"
              required
            />
            <Label
              htmlFor="kvkk"
              className="text-sm font-normal leading-snug text-muted-foreground"
            >
              <Link href="/kvkk" className="text-primary-700 underline">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni okudum ve kişisel verilerimin işlenmesini kabul ediyorum.
            </Label>
          </div>
          <SubmitButton />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Zaten üye misiniz?{" "}
          <Link
            href={`/giris?redirect=${encodeURIComponent(redirectTo)}`}
            className="ml-1 font-medium text-primary-700 hover:underline"
          >
            Giriş yapın
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
