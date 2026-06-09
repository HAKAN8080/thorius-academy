"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  submitInstructorApplication,
  type InstructorApplicationState,
} from "@/lib/actions/instructor-application";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: InstructorApplicationState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-[#D4AF37] text-[#0B1E3F] hover:bg-[#c4a030]">
      {pending ? "Gönderiliyor..." : "Başvuruyu Gönder"}
    </Button>
  );
}

interface InstructorApplicationFormProps {
  defaultFullName: string;
  defaultEmail: string;
}

export function InstructorApplicationForm({
  defaultFullName,
  defaultEmail,
}: InstructorApplicationFormProps) {
  const [state, formAction] = useFormState(
    submitInstructorApplication,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      {state.success && state.message ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Ad Soyad</Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={defaultFullName}
            required
            minLength={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" value={defaultEmail} disabled readOnly />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+90 5xx xxx xx xx"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="expertise">Uzmanlık Alanınız</Label>
          <Input
            id="expertise"
            name="expertise"
            required
            minLength={5}
            placeholder="Örn. Finansal piyasalar, Python, proje yönetimi"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="motivation">Neden eğitmen olmak istiyorsunuz?</Label>
          <Textarea
            id="motivation"
            name="motivation"
            rows={5}
            required
            minLength={20}
            placeholder="Deneyiminizi ve öğrencilere nasıl katkı sağlayacağınızı anlatın..."
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="sample_course_url">
            Örnek içerik linki (isteğe bağlı)
          </Label>
          <Input
            id="sample_course_url"
            name="sample_course_url"
            type="url"
            placeholder="https://youtube.com/... veya portfolyo linki"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Başvurunuz incelendikten sonra{" "}
        <strong>admin@thorius.com.tr</strong> üzerinden size dönüş yapılacaktır.
      </p>

      <SubmitButton />
    </form>
  );
}
