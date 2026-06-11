import { buildBunnyEmbedUrl } from "@/lib/video/bunny-embed";

const BUNNY_VIDEO_API = "https://video.bunnycdn.com";

export interface BunnyStreamConfig {
  libraryId: string;
  apiKey: string;
}

export function getBunnyStreamConfig(): BunnyStreamConfig | null {
  const libraryId = process.env.BUNNY_LIBRARY_ID?.trim();
  const apiKey = process.env.BUNNY_API_KEY?.trim();
  if (!libraryId || !apiKey) {
    return null;
  }
  return { libraryId, apiKey };
}

export function isBunnyStreamUrl(url: string): boolean {
  return buildBunnyEmbedUrl(url) !== null;
}

export function buildBunnyPlayUrl(libraryId: string, videoId: string): string {
  return `https://iframe.mediadelivery.net/play/${libraryId}/${videoId}`;
}

function isYouTubeOrVimeoUrl(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

interface BunnyVideoResponse {
  guid?: string;
  videoLibraryId?: number;
  title?: string;
  status?: number;
}

export async function fetchVideoToBunnyStream(options: {
  sourceUrl: string;
  title: string;
  collectionId?: string;
}): Promise<
  | { playUrl: string; embedUrl: string; videoId: string }
  | { error: string }
> {
  const config = getBunnyStreamConfig();
  if (!config) {
    return {
      error:
        "Bunny Stream yapılandırılmamış (BUNNY_LIBRARY_ID / BUNNY_API_KEY).",
    };
  }

  const sourceUrl = options.sourceUrl.trim();
  if (!sourceUrl) {
    return { error: "Video URL boş." };
  }

  if (isBunnyStreamUrl(sourceUrl)) {
    const match = sourceUrl.match(
      /mediadelivery\.net\/(?:embed|play)\/(\d+)\/([a-f0-9-]+)/i,
    );
    if (match) {
      const playUrl = buildBunnyPlayUrl(match[1], match[2]);
      const embedUrl = buildBunnyEmbedUrl(playUrl) ?? playUrl;
      return { playUrl, embedUrl, videoId: match[2] };
    }
  }

  if (isYouTubeOrVimeoUrl(sourceUrl)) {
    return {
      error:
        "YouTube ve Vimeo linkleri otomatik Bunny'ye aktarılamaz. Doğrudan MP4/CDN linki veya Bunny Stream play/embed linki girin.",
    };
  }

  try {
    const response = await fetch(
      `${BUNNY_VIDEO_API}/library/${config.libraryId}/videos/fetch`,
      {
        method: "POST",
        headers: {
          AccessKey: config.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title: options.title.trim() || "Thorius Academy Ders",
          url: sourceUrl,
          ...(options.collectionId
            ? { collectionId: options.collectionId }
            : {}),
        }),
        signal: AbortSignal.timeout(120_000),
      },
    );

    const body = (await response.json().catch(() => null)) as
      | BunnyVideoResponse
      | { Message?: string; message?: string }
      | null;

    if (!response.ok) {
      const apiMessage =
        body && typeof body === "object" && "Message" in body
          ? body.Message
          : body && typeof body === "object" && "message" in body
            ? body.message
            : undefined;
      const message = apiMessage || `Bunny API ${response.status}`;
      return { error: `Bunny Stream aktarımı başarısız: ${message}` };
    }

    const videoId =
      body && typeof body === "object" && "guid" in body ? body.guid : undefined;
    if (!videoId) {
      return { error: "Bunny Stream yanıtında video kimliği yok." };
    }

    const playUrl = buildBunnyPlayUrl(config.libraryId, videoId);
    const embedUrl = buildBunnyEmbedUrl(playUrl) ?? playUrl;
    return { playUrl, embedUrl, videoId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: `Bunny Stream bağlantı hatası: ${message}` };
  }
}

/** Harici URL'yi Bunny play linkine çevirir; zaten Bunny ise normalize eder. */
export async function ensureBunnyStreamVideoUrl(
  sourceUrl: string,
  title: string,
  options?: { collectionId?: string },
): Promise<{ videoUrl: string; embedUrl: string } | { error: string }> {
  const trimmed = sourceUrl.trim();
  if (!trimmed) {
    return { videoUrl: "", embedUrl: "" };
  }

  if (isBunnyStreamUrl(trimmed)) {
    const playUrl = trimmed.includes("/play/")
      ? trimmed
      : (buildBunnyEmbedUrl(trimmed)?.replace("/embed/", "/play/") ?? trimmed);
    const embedUrl = buildBunnyEmbedUrl(playUrl) ?? trimmed;
    return { videoUrl: playUrl, embedUrl };
  }

  const config = getBunnyStreamConfig();
  if (!config) {
    return {
      error:
        "Video Bunny Stream'e aktarılamadı: sunucuda BUNNY_LIBRARY_ID ve BUNNY_API_KEY tanımlı değil.",
    };
  }

  const imported = await fetchVideoToBunnyStream({
    sourceUrl: trimmed,
    title,
    collectionId: options?.collectionId,
  });
  if ("error" in imported) {
    return imported;
  }

  return { videoUrl: imported.playUrl, embedUrl: imported.embedUrl };
}
