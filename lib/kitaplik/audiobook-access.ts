import { cache } from "react";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "audiobook-files";
const SIGNED_URL_TTL_SECONDS = 3 * 60 * 60;

export interface AudiobookChapterMeta {
  number: number;
  title: string;
  durationSec: number;
}

export interface AudiobookManifest {
  slug: string;
  chapterCount: number;
  totalDurationSec: number;
  chapters: AudiobookChapterMeta[];
}

export interface AudiobookChapterSource extends AudiobookChapterMeta {
  audioUrl: string;
  timingUrl: string;
}

/** Manifest varsa kitabin sesli surumu yayinda demektir. */
export const getAudiobookManifest = cache(
  async (slug: string): Promise<AudiobookManifest | null> => {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.storage
      .from(BUCKET)
      .download(`${slug}/manifest.json`);

    if (error || !data) {
      return null;
    }

    try {
      const manifest = JSON.parse(await data.text()) as AudiobookManifest;
      if (!Array.isArray(manifest.chapters) || manifest.chapters.length === 0) {
        return null;
      }
      return manifest;
    } catch (parseError) {
      console.error("[audiobook] manifest parse failed:", slug, parseError);
      return null;
    }
  },
);

function chapterFileStem(number: number): string {
  return `chapter_${String(number).padStart(2, "0")}`;
}

/** Yetki kontrolu cagiran tarafta yapilir; burada sadece imzali URL uretilir. */
export async function getAudiobookChapterSources(
  manifest: AudiobookManifest,
): Promise<AudiobookChapterSource[]> {
  const admin = getSupabaseAdmin();
  const paths = manifest.chapters.flatMap((chapter) => {
    const stem = `${manifest.slug}/${chapterFileStem(chapter.number)}`;
    return [`${stem}.mp3`, `${stem}.json`];
  });

  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    throw new Error(
      `Sesli kitap URL'leri oluşturulamadı: ${error?.message ?? "boş yanıt"}`,
    );
  }

  const urlByPath = new Map(
    data.filter((row) => row.signedUrl).map((row) => [row.path, row.signedUrl]),
  );

  return manifest.chapters.map((chapter) => {
    const stem = `${manifest.slug}/${chapterFileStem(chapter.number)}`;
    const audioUrl = urlByPath.get(`${stem}.mp3`);
    const timingUrl = urlByPath.get(`${stem}.json`);
    if (!audioUrl || !timingUrl) {
      throw new Error(`Sesli kitap dosyası eksik: ${stem}`);
    }
    return { ...chapter, audioUrl, timingUrl };
  });
}
