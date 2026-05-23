import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  BookOpen,
  Calendar,
  User,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserEnrollments } from "@/lib/actions/enrollment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const enrollments = await getUserEnrollments();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-accent-500/10 p-2">
            <GraduationCap className="h-6 w-6 text-accent-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary-950 md:text-4xl">
            Kurslarım
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          {enrollments.length > 0
            ? `${enrollments.length} kursa kayıtlısınız`
            : "Henüz kayıtlı olduğunuz bir kurs yok"}
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
            hemen başlayın.
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
            <article
              key={enrollment.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative aspect-video bg-primary-50">
                {enrollment.course_image ? (
                  <Image
                    src={enrollment.course_image}
                    alt={enrollment.course_title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                    <span className="text-4xl font-bold text-primary-300">
                      T
                    </span>
                  </div>
                )}
                {enrollment.course_category && (
                  <div className="absolute left-3 top-3">
                    <Badge className="border-0 bg-primary-950/90 text-white backdrop-blur-sm">
                      {enrollment.course_category}
                    </Badge>
                  </div>
                )}
                {enrollment.status === "completed" && (
                  <div className="absolute right-3 top-3">
                    <Badge className="border-0 bg-green-500 text-white">
                      Tamamlandı
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex flex-grow flex-col gap-3 p-5">
                <h3 className="line-clamp-2 text-lg font-bold text-primary-950">
                  {enrollment.course_title}
                </h3>

                {enrollment.instructor_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{enrollment.instructor_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Kayıt:{" "}
                    {new Date(enrollment.enrolled_at).toLocaleDateString(
                      "tr-TR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>

                {enrollment.progress > 0 && (
                  <div className="mt-2">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>İlerleme</span>
                      <span>{enrollment.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-primary-100">
                      <div
                        className="h-full bg-gradient-to-r from-accent-400 to-accent-600 transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-auto border-t border-primary-50 pt-3">
                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-primary-950 text-white hover:bg-primary-900"
                  >
                    <Link href={`/kurslar/${enrollment.course_slug}`}>
                      Kursa Devam Et
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
