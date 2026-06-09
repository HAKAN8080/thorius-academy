import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { getUserProfile } from "@/lib/actions/profile";
import { ProfileForm } from "@/components/panel/profile-form";

export const metadata: Metadata = {
  title: "Profilim",
  description: "Profil bilgilerinizi görüntüleyin ve güncelleyin.",
};

export default async function ProfilePage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/giris?redirect=/panel/profil");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-accent-500/10 p-2">
            <User className="h-6 w-6 text-accent-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary-950">Profilim</h1>
        </div>
        <p className="text-muted-foreground">
          Kişisel bilgilerinizi güncelleyin. Değişiklikler WordPress hesabınıza
          yansıtılır.
        </p>
      </header>

      <div className="rounded-2xl border border-primary-100 bg-white p-6">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
