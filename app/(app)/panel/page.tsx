import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Award, Clock } from "lucide-react";

export default async function PanelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const meta = user?.user_metadata as { full_name?: string } | undefined;
  const displayName = meta?.full_name ?? user?.email?.split("@")[0] ?? "Üye";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-primary-900">
        Merhaba, {displayName}
      </h1>
      <p className="mt-2 text-primary-700">
        Öğrenme paneliniz yakında aktif olacak. Şimdilik özet görünümü
        inceleyebilirsiniz.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <Card className="border-primary-100">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <BookOpen className="h-5 w-5 text-accent-600" aria-hidden="true" />
            <CardTitle className="text-base">Devam Eden</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-900">0</p>
            <p className="text-sm text-muted-foreground">kurs</p>
          </CardContent>
        </Card>
        <Card className="border-primary-100">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Award className="h-5 w-5 text-accent-600" aria-hidden="true" />
            <CardTitle className="text-base">Tamamlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-900">0</p>
            <p className="text-sm text-muted-foreground">sertifika</p>
          </CardContent>
        </Card>
        <Card className="border-primary-100">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Clock className="h-5 w-5 text-accent-600" aria-hidden="true" />
            <CardTitle className="text-base">Toplam Süre</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-900">0</p>
            <p className="text-sm text-muted-foreground">saat</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-10 border-dashed border-primary-200 bg-white">
        <CardContent className="py-12 text-center text-primary-600">
          Video oynatıcı, ilerleme takibi ve sertifikalar bir sonraki sprintte
          eklenecek.
        </CardContent>
      </Card>
    </div>
  );
}
