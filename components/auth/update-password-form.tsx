"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { updatePassword, type AuthActionState } from "@/lib/actions/auth";
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
      {pending ? "Kaydediliyor..." : "Yeni Şifremi Kaydet"}
    </Button>
  );
}

export function UpdatePasswordForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useFormState(updatePassword, initialState);

  return (
    <Card className="border-primary-100 shadow-lg">
      <CardHeader>
        <CardTitle className="text-primary-900">Yeni Şifre Belirleyin</CardTitle>
        <CardDescription>
          Üyelik güvenliğiniz için yeni parolanızı girin. Kaydettikten sonra
          kurslarınıza yönlendirileceksiniz.
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
            <Label htmlFor="password">Yeni parola</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Yeni parola (tekrar)</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>
          <SubmitButton />
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <Link href="/giris" className="font-medium text-primary-700 hover:underline">
            Giriş sayfasına dön
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
