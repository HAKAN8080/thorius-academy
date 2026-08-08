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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractBunnyVideoId(body: unknown): string | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const record = body as Record<string, unknown>;
  if (typeof record.guid === "string" && record.guid.trim()) {
    return record.guid.trim();
  }

  const nested = record.video;
  if (nested && typeof nested === "object") {
    const nestedGuid = (nested as Record<string, unknown>).guid;
    if (typeof nestedGuid === "string" && nestedGuid.trim()) {
      return nestedGuid.trim();
    }
  }

  return undefined;
}

function readBunnyMessage(body: unknown): string | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }
  const record = body as Record<string, unknown>;
  if (typeof record.Message === "string" && record.Message.trim()) {
    return record.Message.trim();
  }
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }
  return undefined;
}

function isBunnyStatusSuccess(body: unknown, httpOk: boolean): boolean {
  if (!httpOk) {
    return false;
  }
  if (!body || typeof body !== "object") {
    return httpOk;
  }
  const record = body as Record<string, unknown>;
  if (typeof record.success === "boolean") {
    return record.success;
  }
  // Legacy: video object with guid
  return Boolean(extractBunnyVideoId(body));
}

async function findBunnyVideoIdByTitle(options: {
  config: BunnyStreamConfig;
  title: string;
  collectionId?: string;
}): Promise<string | undefined> {
  const { config, title, collectionId } = options;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (attempt > 0) {
      await sleep(700);
    }

    const listUrl = new URL(
      `${BUNNY_VIDEO_API}/library/${config.libraryId}/videos`,
    );
    listUrl.searchParams.set("page", "1");
    listUrl.searchParams.set("itemsPerPage", "25");
    listUrl.searchParams.set("orderBy", "date");
    listUrl.searchParams.set("search", title);
    if (collectionId) {
      listUrl.searchParams.set("collection", collectionId);
    }

    const response = await fetch(listUrl.toString(), {
      method: "GET",
      headers: {
        AccessKey: config.apiKey,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      continue;
    }

    const body = (await response.json().catch(() => null)) as
      | {
          items?: Array<{ guid?: string; title?: string }>;
          Items?: Array<{ guid?: string; title?: string }>;
        }
      | null;

    const items = body?.items ?? body?.Items ?? [];
    const exact = items.find(
      (item) => item.title === title && typeof item.guid === "string",
    );
    if (exact?.guid) {
      return exact.guid;
    }

    const fuzzy = items.find(
      (item) =>
        typeof item.title === "string" &&
        item.title.includes(title) &&
        typeof item.guid === "string",
    );
    if (fuzzy?.guid) {
      return fuzzy.guid;
    }
  }

  return undefined;
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

  // Fetch API returns StatusModel (no guid). Use a unique title so we can look it up.
  const uniqueTitle = `${options.title.trim() || "Thorius Academy Ders"} · ${Date.now().toString(36)}`;

  try {
    const fetchUrl = new URL(
      `${BUNNY_VIDEO_API}/library/${config.libraryId}/videos/fetch`,
    );
    if (options.collectionId) {
      fetchUrl.searchParams.set("collectionId", options.collectionId);
    }

    const response = await fetch(fetchUrl.toString(), {
      method: "POST",
      headers: {
        AccessKey: config.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title: uniqueTitle,
        url: sourceUrl,
      }),
      signal: AbortSignal.timeout(120_000),
    });

    const body = (await response.json().catch(() => null)) as unknown;

    if (!isBunnyStatusSuccess(body, response.ok)) {
      const message =
        readBunnyMessage(body) || `Bunny API ${response.status}`;
      return { error: `Bunny Stream aktarımı başarısız: ${message}` };
    }

    let videoId = extractBunnyVideoId(body);
    if (!videoId) {
      videoId = await findBunnyVideoIdByTitle({
        config,
        title: uniqueTitle,
        collectionId: options.collectionId,
      });
    }

    if (!videoId) {
      return {
        error:
          "Bunny Stream videoyu aldı ama kimlik henüz listelenmedi. Birkaç saniye sonra tekrar deneyin veya Dosya yükle kullanın.",
      };
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
