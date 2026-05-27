import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserEnrollments } from "@/lib/actions/enrollment";
import { getInstructorAccess } from "@/lib/instructor/access";
import { getInstructorPortalUrl } from "@/lib/config/portal-urls";
import { TutorDashboardLink } from "@/components/layout/tutor-dashboard-link";
import { BookOpen, GraduationCap, ArrowRight, User, Presentation } from "lucide-react";

export const metadata: Metadata = {
  title: "Panel",
};

export default async function PanelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/giris");

  const access = await getInstructorAccess();
  const enrollments = await getUserEnrollments();
  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const completedEnrollments = enrollments.filter(
    (e) => e.status === "completed"
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-primary-950 md:text-4xl">
          Hoş geldiniz! 👋
        </h1>
        <p className="text-lg text-muted-foreground">{user.email}</p>
      </header>

      <div className="mb-10">
        <TutorDashboardLink variant="student" />
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-accent-50 p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-primary-950 p-2">
              <BookOpen className="h-5 w-5 text-accent-400" />
            </div>
            <h3 className="font-semibold text-primary-950">Aktif Kurslar</h3>
          </div>
          <p className="text-3xl font-bold text-primary-950">
            {activeEnrollments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-accent-50 p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-primary-950 p-2">
              <GraduationCap className="h-5 w-5 text-accent-400" />
            </div>
            <h3 className="font-semibold text-primary-950">Tamamlanan</h3>
          </div>
          <p className="text-3xl font-bold text-primary-950">
            {completedEnrollments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-accent-500/20 bg-gradient-to-br from-primary-900 to-primary-950 p-6 text-white">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-accent-500/20 p-2">
              <User className="h-5 w-5 text-accent-400" />
            </div>
            <h3 className="font-semibold">Hesabım</h3>
          </div>
          <p className="truncate text-sm text-primary-100">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {access.isInstructor ? (
          <Link
            href={getInstructorPortalUrl()}
            className="group rounded-2xl border-2 border-primary-100 bg-white p-6 transition-all hover:border-accent-500 hover:shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-lg bg-accent-500/10 p-3">
                <Presentation className="h-6 w-6 text-accent-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-primary-400 transition-all group-hover:translate-x-1 group-hover:text-accent-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-primary-950">
              Eğitmen Paneli
            </h3>
            <p className="text-muted-foreground">
              Verdiğiniz kursları, öğrenci sayılarını ve yorumları görün
            </p>
          </Link>
        ) : null}

        <Link
          href="/panel/kurslarim"
          className="group rounded-2xl border-2 border-primary-100 bg-white p-6 transition-all hover:border-accent-500 hover:shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="rounded-lg bg-accent-500/10 p-3">
              <BookOpen className="h-6 w-6 text-accent-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-primary-400 transition-all group-hover:translate-x-1 group-hover:text-accent-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-primary-950">
            {access.isInstructor ? "Kayıtlı Kurslarım" : "Kurslarım"}
          </h3>
          <p className="text-muted-foreground">
            {access.isInstructor
              ? "Öğrenci olarak kayıt olduğunuz kursları görüntüleyin"
              : "Kayıtlı olduğunuz tüm kursları görüntüleyin"}
          </p>
        </Link>

        <Link
          href="/kurslar"
          className="group rounded-2xl border border-accent-500/30 bg-gradient-to-br from-primary-900 to-primary-950 p-6 text-white transition-all hover:shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="rounded-lg bg-accent-500/20 p-3">
              <GraduationCap className="h-6 w-6 text-accent-400" />
            </div>
            <ArrowRight className="h-5 w-5 text-primary-100 transition-all group-hover:translate-x-1 group-hover:text-accent-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Yeni Kurs Keşfet</h3>
          <p className="text-primary-100">65+ premium kursumuzu inceleyin</p>
        </Link>
      </div>
    </div>
  );
}
