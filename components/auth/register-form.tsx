"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signUp, type AuthActionState } from "@/lib/actions/auth";
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

export function RegisterForm() {
  const [state, formAction] = useFormState(signUp, initialState);

  return (
    <Card className="border-primary-100 shadow-lg">
      <CardHeader>
        <CardTitle className="text-primary-900">Üye Olun</CardTitle>
        <CardDescription>
          Premium perakende eğitim dünyasına adım atın
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state.error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-900" role="status">
              {state.success}
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
            <Label htmlFor="kvkk" className="text-sm font-normal leading-snug text-muted-foreground">
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
          <Link href="/giris" className="ml-1 font-medium text-primary-700 hover:underline">
            Giriş yapın
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
