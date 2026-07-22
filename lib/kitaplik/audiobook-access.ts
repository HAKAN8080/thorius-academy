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

function audiobookCdnBase(): string | null {
  const base = process.env.NEXT_PUBLIC_AUDIOBOOK_CDN_BASE_URL?.trim();
  if (!base) return null;
  return base.replace(/\/$/, "");
}

function chapterFileStem(number: number): string {
  return `chapter_${String(number).padStart(2, "0")}`;
}

function cdnObjectUrl(slug: string, filename: string): string {
  const base = audiobookCdnBase();
  if (!base) {
    throw new Error("NEXT_PUBLIC_AUDIOBOOK_CDN_BASE_URL is not set");
  }
  return `${base}/${slug}/${filename}`;
}

async function fetchCdnManifest(slug: string): Promise<AudiobookManifest | null> {
  if (!audiobookCdnBase()) return null;

  try {
    const response = await fetch(cdnObjectUrl(slug, "manifest.json"), {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    const manifest = (await response.json()) as AudiobookManifest;
    if (!Array.isArray(manifest.chapters) || manifest.chapters.length === 0) {
      return null;
    }
    return manifest;
  } catch (error) {
    console.error("[audiobook] CDN manifest fetch failed:", slug, error);
    return null;
  }
}

async function fetchSupabaseManifest(
  slug: string,
): Promise<AudiobookManifest | null> {
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
}

/** Manifest varsa kitabin sesli surumu yayinda demektir. */
export const getAudiobookManifest = cache(
  async (slug: string): Promise<AudiobookManifest | null> => {
    const fromCdn = await fetchCdnManifest(slug);
    if (fromCdn) return fromCdn;
    return fetchSupabaseManifest(slug);
  },
);

function chapterSourcesFromCdn(
  manifest: AudiobookManifest,
): AudiobookChapterSource[] {
  return manifest.chapters.map((chapter) => {
    const stem = chapterFileStem(chapter.number);
    return {
      ...chapter,
      audioUrl: cdnObjectUrl(manifest.slug, `${stem}.mp3`),
      timingUrl: cdnObjectUrl(manifest.slug, `${stem}.json`),
    };
  });
}

async function chapterSourcesFromSupabase(
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

/**
 * Yetki kontrolu cagiran tarafta yapilir.
 * CDN base ayarliysa ve manifest CDN'den geldiyse public CDN URL kullanilir;
 * aksi halde Supabase imzali URL uretilir.
 */
export async function getAudiobookChapterSources(
  manifest: AudiobookManifest,
): Promise<AudiobookChapterSource[]> {
  if (audiobookCdnBase()) {
    // Prefer CDN when configured: files live under kitaplik/{slug}/ on Bunny.
    // Entitlement remains on the /dinle page; URLs are only handed to entitled users.
    try {
      const probe = await fetch(cdnObjectUrl(manifest.slug, "manifest.json"), {
        method: "HEAD",
        next: { revalidate: 60 },
      });
      if (probe.ok) {
        return chapterSourcesFromCdn(manifest);
      }
    } catch {
      // Fall through to Supabase signed URLs.
    }
  }

  return chapterSourcesFromSupabase(manifest);
}
