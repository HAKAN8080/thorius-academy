import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getInstructorAccess } from "@/lib/instructor/access";
import {
  getInstructorApplicationStatus,
} from "@/lib/actions/instructor-application";
import { getUserProfile } from "@/lib/actions/profile";
import { InstructorApplicationForm } from "@/components/panel/instructor-application-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Eğitmen Başvurusu",
  description: "Thorius Academy'de eğitmen olmak için başvurun.",
};

export default async function InstructorApplicationPage() {
  const access = await getInstructorAccess();
  const profile = await getUserProfile();
  const application = await getInstructorApplicationStatus();

  if (!profile) {
    redirect("/giris?redirect=/panel/egitmen-basvuru");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-accent-500/10 p-2">
            <GraduationCap className="h-6 w-6 text-accent-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary-950">
            Eğitmen Olmak İstiyorum
          </h1>
        </div>
        <p className="text-muted-foreground">
          Uzmanlığınızı paylaşmak için başvurunuzu gönderin. Ekibimiz
          inceledikten sonra size dönüş yapacaktır.
        </p>
      </header>

      {access.isInstructor ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <p className="text-green-800">
            Zaten eğitmen hesabınız aktif. Kurs yönetimi için{" "}
            <Link
              href="/instructor/courses"
              className="font-semibold text-green-900 underline"
            >
              Kurs Yönetimi
            </Link>{" "}
            bölümüne geçebilirsiniz.
          </p>
        </div>
      ) : application.hasPending ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-amber-900">
            Başvurunuz inceleniyor
          </h2>
          <p className="text-amber-800">
            {application.createdAt
              ? `${new Date(application.createdAt).toLocaleDateString("tr-TR")} tarihinde gönderdiğiniz başvuru değerlendirme aşamasındadır.`
              : "Başvurunuz değerlendirme aşamasındadır."}{" "}
            Sonuç e-posta ile bildirilecektir.
          </p>
        </div>
      ) : application.latestStatus === "rejected" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-red-800">
              Önceki başvurunuz reddedildi. Güncellenmiş bilgilerle tekrar
              başvurabilirsiniz.
            </p>
          </div>
          <div className="rounded-2xl border border-primary-100 bg-white p-6">
            <InstructorApplicationForm
              defaultFullName={profile.full_name ?? ""}
              defaultEmail={profile.email}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-primary-100 bg-white p-6">
          <InstructorApplicationForm
            defaultFullName={profile.full_name ?? ""}
            defaultEmail={profile.email}
          />
        </div>
      )}

      {!access.isInstructor && !application.hasPending ? (
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/panel">Panele Dön</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
