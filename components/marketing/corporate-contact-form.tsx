"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  submitCorporateContact,
  type CorporateContactState,
} from "@/lib/actions/corporate-contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CorporateContactState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gold" className="w-full" disabled={pending}>
      {pending ? "Gönderiliyor..." : "Gönder"}
    </Button>
  );
}

export function CorporateContactForm() {
  const [state, formAction] = useFormState(submitCorporateContact, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
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
        <Label htmlFor="company">Şirket Adı</Label>
        <Input id="company" name="company" required placeholder="Marka / Şirket" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-name">Ad Soyad</Label>
        <Input id="contact-name" name="contactName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">Kurumsal E-posta</Label>
        <Input id="contact-email" name="contactEmail" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="employees">Çalışan Sayısı</Label>
        <Input
          id="employees"
          name="employees"
          type="number"
          min={1}
          placeholder="ör. 150"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
