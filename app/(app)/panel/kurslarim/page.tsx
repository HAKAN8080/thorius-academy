import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserEnrollments } from "@/lib/actions/enrollment";
import { getInstructorAccess } from "@/lib/instructor/access";
import { EnrollmentCourseCard } from "@/components/panel/enrollment-course-card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kurslarım",
  description: "Kayıt olduğunuz tüm kurslar tek yerde.",
};

export default async function MyCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/giris?redirect=/panel/kurslarim");
  }

  const access = await getInstructorAccess();
  const enrollments = await getUserEnrollments();

  const pageTitle = access.isInstructor ? "Öğrenci Kurslarım" : "Kurslarım";
  const pageDescription = access.isInstructor
    ? "Öğrenci olarak kayıt olduğunuz kurslar"
    : "Kayıtlı olduğunuz tüm kurslar tek yerde.";

  return (
    <div>
      <header className="mb-10">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-accent-500/10 p-2">
            <GraduationCap className="h-6 w-6 text-accent-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary-950 md:text-4xl">
            {pageTitle}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          {enrollments.length > 0
            ? `${enrollments.length} kursa kayıtlısınız — ilerleme ve durum bilgileri aşağıda`
            : pageDescription}
        </p>
      </header>

      {enrollments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-primary-100 bg-primary-50/50 p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-primary-300" />
          <h2 className="mb-2 text-xl font-semibold text-primary-950">
            Henüz kursa kayıtlı değilsiniz
          </h2>
          <p className="mx-auto mb-6 max-w-md text-muted-foreground">
            Kariyerinizi bir sonraki seviyeye taşıyacak kursları keşfedin ve
            hemen başlayın. Daha önce satın aldığınız kurslar giriş yaptığınızda
            otomatik senkronize edilir.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
          >
            <Link href="/kurslar">
              Kurslara Göz At
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <EnrollmentCourseCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
}
