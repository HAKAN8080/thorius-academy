import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPathForm } from "@/components/career-path/admin-path-form";
import { isCareerPathAdmin } from "@/lib/career-path/admin-access";
import type { CareerPathAdminInput } from "@/lib/career-path/types";

export const metadata: Metadata = {
  title: "Yeni Kariyer Yolu",
};

const emptyForm: CareerPathAdminInput = {
  slug: "",
  title: "",
  subtitle: "",
  heroEyebrow: "Uzmanlık Akademisi",
  outcomes: [],
  catalogHref: "/kurslar",
  catalogLabel: "İlgili kurslar",
  closingTitle: "",
  closingDescription: "",
  isPublished: false,
  sortOrder: 10,
  steps: [
    {
      stepOrder: 1,
      level: "Adım 1",
      label: "Perakende planlamaya giriş",
      courseSlug: "",
      fallbackTitle: "",
      description: "",
    },
  ],
};

export default async function NewCareerPathPage() {
  const allowed = await isCareerPathAdmin();
  if (!allowed) {
    redirect("/panel");
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/panel/yonetim/kariyer-yollari"
        className="mb-6 inline-flex items-center text-sm font-medium text-primary-700 hover:text-primary-950"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Kariyer yolları listesi
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-950">Yeni kariyer yolu</h1>
        <p className="mt-2 text-muted-foreground">
          Adımları sırayla tanımlayın; öğrenciler önceki adımı bitirmeden
          sonrakine geçemez.
        </p>
      </header>

      <AdminPathForm initial={emptyForm} />
    </div>
  );
}
