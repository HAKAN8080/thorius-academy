"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  updateUserProfile,
  type ProfileActionState,
  type UserProfile,
} from "@/lib/actions/profile";
import { ProfileAvatarUploadField } from "@/components/panel/profile-avatar-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ProfileActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-[#D4AF37] text-[#0B1E3F] hover:bg-[#c4a030]">
      {pending ? "Kaydediliyor..." : "Profili Kaydet"}
    </Button>
  );
}

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [state, formAction] = useFormState(updateUserProfile, initialState);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

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
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" value={profile.email} disabled readOnly />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="full_name">Ad Soyad</Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={profile.full_name ?? ""}
            required
            minLength={2}
            placeholder="Adınız Soyadınız"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
            placeholder="+90 5xx xxx xx xx"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <input type="hidden" name="avatar_url" value={avatarUrl} />
          <ProfileAvatarUploadField
            value={avatarUrl || null}
            onChange={(url) => setAvatarUrl(url ?? "")}
            previewAlt={profile.full_name ?? "Profil fotoğrafı"}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bio">Hakkımda</Label>
          <Textarea
            id="bio"
            name="bio"
            rows={5}
            defaultValue={profile.bio ?? ""}
            placeholder="Kendinizi kısaca tanıtın..."
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Profil bilgileriniz Academy&apos;de saklanır ve WordPress hesabınıza
        senkronize edilir.
      </p>

      <SubmitButton />
    </form>
  );
}
