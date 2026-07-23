import { NextResponse } from "next/server";
import {
  getAudiobookChapterSources,
  getAudiobookManifest,
} from "@/lib/kitaplik/audiobook-access";
import { parseAudiobookCues } from "@/lib/kitaplik/audiobook-cues";
import { getKitaplikBookPurchaseState } from "@/lib/kitaplik/book-purchase-state";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ slug: string; chapter: string }>;
}

/**
 * Same-origin proxy for audiobook cue JSON.
 * Bunny CDN serves .json without CORS; browser fetch of timingUrl fails.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { slug, chapter: chapterParam } = await params;
  const chapterNumber = Number(chapterParam);
  if (!slug || !Number.isInteger(chapterNumber) || chapterNumber < 0) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const { book, hasEbookAccess } = await getKitaplikBookPurchaseState(slug);
  if (!book || !hasEbookAccess) {
    return NextResponse.json({ error: "Erişim yok." }, { status: 403 });
  }

  const manifest = await getAudiobookManifest(slug);
  if (!manifest) {
    return NextResponse.json({ error: "Sesli sürüm yok." }, { status: 404 });
  }

  const chapters = await getAudiobookChapterSources(manifest);
  const chapter = chapters.find((item) => item.number === chapterNumber);
  if (!chapter) {
    return NextResponse.json({ error: "Bölüm yok." }, { status: 404 });
  }

  try {
    const response = await fetch(chapter.timingUrl, {
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Altyazı dosyası alınamadı." },
        { status: 502 },
      );
    }
    const payload: unknown = await response.json();
    const cues = parseAudiobookCues(payload);
    return NextResponse.json(
      { cues },
      {
        headers: {
          "Cache-Control": "private, max-age=60",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Altyazı yüklenemedi." },
      { status: 502 },
    );
  }
}
