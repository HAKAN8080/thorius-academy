"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestPasswordReset, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" className="w-full" disabled={pending}>
      {pending ? "Gönderiliyor..." : "Sıfırlama bağlantısı gönder"}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(requestPasswordReset, initialState);

  return (
    <div className="mt-6 border-t border-primary-100 pt-6">
      <h3 className="mb-2 text-sm font-semibold text-primary-900">
        Parolamı unuttum
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Satın alma sonrası oluşturulan hesabınız için e-posta adresinize giriş
        bağlantısı gönderilir.
      </p>
      <form action={formAction} className="space-y-3">
        {state.error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state.success && state.successMessage && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
            {state.successMessage}
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="reset-email">E-posta</Label>
          <Input
            id="reset-email"
            name="email"
            type="email"
            placeholder="ornek@sirket.com"
            required
            autoComplete="email"
          />
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
