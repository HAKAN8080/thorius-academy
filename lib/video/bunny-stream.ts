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

function asRecord(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  return body as Record<string, unknown>;
}

/** Bunny may return camelCase or PascalCase JSON depending on endpoint/proxy. */
function readBunnyString(
  body: unknown,
  ...keys: string[]
): string | undefined {
  const record = asRecord(body);
  if (!record) {
    return undefined;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function readBunnyBoolean(
  body: unknown,
  ...keys: string[]
): boolean | undefined {
  const record = asRecord(body);
  if (!record) {
    return undefined;
  }
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") {
      return value;
    }
  }
  return undefined;
}

export function extractBunnyVideoId(body: unknown): string | undefined {
  const direct = readBunnyString(body, "guid", "Guid", "videoId", "VideoId");
  if (direct) {
    return direct;
  }

  const record = asRecord(body);
  const nested = record?.video ?? record?.Video;
  if (nested && typeof nested === "object") {
    return readBunnyString(nested, "guid", "Guid", "videoId", "VideoId");
  }

  return undefined;
}

export function readBunnyMessage(body: unknown): string | undefined {
  return readBunnyString(body, "Message", "message");
}

function isBunnyStatusSuccess(body: unknown, httpOk: boolean): boolean {
  if (!httpOk) {
    return false;
  }
  if (!body || typeof body !== "object") {
    return httpOk;
  }
  const success = readBunnyBoolean(body, "success", "Success");
  if (typeof success === "boolean") {
    return success;
  }
  // Legacy: video object with guid
  return Boolean(extractBunnyVideoId(body));
}

function readBunnyListItems(
  body: unknown,
): Array<{ guid?: string; title?: string }> {
  const record = asRecord(body);
  if (!record) {
    return [];
  }
  const raw = record.items ?? record.Items;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item) => {
    if (!item || typeof item !== "object") {
      return {};
    }
    return {
      guid: readBunnyString(item, "guid", "Guid"),
      title: readBunnyString(item, "title", "Title"),
    };
  });
}

async function createBunnyVideoObject(options: {
  config: BunnyStreamConfig;
  title: string;
  collectionId?: string;
}): Promise<{ videoId: string } | { error: string }> {
  const { config, title, collectionId } = options;

  const response = await fetch(
    `${BUNNY_VIDEO_API}/library/${config.libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: config.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title: title.trim() || "Thorius Academy Ders",
        ...(collectionId ? { collectionId } : {}),
      }),
      signal: AbortSignal.timeout(30_000),
    },
  );

  const body = (await response.json().catch(() => null)) as unknown;
  const videoId = extractBunnyVideoId(body);

  if (!response.ok || !videoId) {
    const message =
      readBunnyMessage(body) ||
      (response.ok
        ? "Bunny Stream yanıtında video kimliği yok."
        : `Bunny video oluşturulamadı (${response.status})`);
    return { error: message };
  }

  return { videoId };
}

async function findBunnyVideoIdByTitle(options: {
  config: BunnyStreamConfig;
  title: string;
  collectionId?: string;
}): Promise<string | undefined> {
  const { config, title, collectionId } = options;
  const marker = title.includes(" · ") ? title.split(" · ").pop()!.trim() : title;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (attempt > 0) {
      await sleep(Math.min(400 * 2 ** (attempt - 1), 2500));
    }

    const searches: Array<{ search?: string; collection?: string }> = [
      { search: marker, collection: collectionId },
      { search: marker },
      { search: title },
      {},
    ];

    for (const query of searches) {
      const listUrl = new URL(
        `${BUNNY_VIDEO_API}/library/${config.libraryId}/videos`,
      );
      listUrl.searchParams.set("page", "1");
      listUrl.searchParams.set("itemsPerPage", "50");
      listUrl.searchParams.set("orderBy", "date");
      if (query.search) {
        listUrl.searchParams.set("search", query.search);
      }
      if (query.collection) {
        listUrl.searchParams.set("collection", query.collection);
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

      const body = (await response.json().catch(() => null)) as unknown;
      const items = readBunnyListItems(body);

      const exact = items.find(
        (item) => item.title === title && typeof item.guid === "string",
      );
      if (exact?.guid) {
        return exact.guid;
      }

      const byMarker = items.find(
        (item) =>
          typeof item.title === "string" &&
          item.title.includes(marker) &&
          typeof item.guid === "string",
      );
      if (byMarker?.guid) {
        return byMarker.guid;
      }
    }
  }

  return undefined;
}

/**
 * Prefer create-video (returns guid) + fetch-into-videoId.
 * Fall back to FetchNewVideo (StatusModel only) + title lookup.
 */
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

  const videoTitle = options.title.trim() || "Thorius Academy Ders";

  try {
    const created = await createBunnyVideoObject({
      config,
      title: videoTitle,
      collectionId: options.collectionId,
    });
    if ("error" in created) {
      return created;
    }

    const intoVideoResponse = await fetch(
      `${BUNNY_VIDEO_API}/library/${config.libraryId}/videos/${created.videoId}/fetch`,
      {
        method: "POST",
        headers: {
          AccessKey: config.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ url: sourceUrl }),
        signal: AbortSignal.timeout(120_000),
      },
    );

    const intoVideoBody = (await intoVideoResponse.json().catch(() => null)) as unknown;

    if (isBunnyStatusSuccess(intoVideoBody, intoVideoResponse.ok)) {
      const playUrl = buildBunnyPlayUrl(config.libraryId, created.videoId);
      const embedUrl = buildBunnyEmbedUrl(playUrl) ?? playUrl;
      return { playUrl, embedUrl, videoId: created.videoId };
    }

    // Endpoint missing / older library: fall back to FetchNewVideo + title lookup.
    if (
      intoVideoResponse.status === 404 ||
      intoVideoResponse.status === 405 ||
      intoVideoResponse.status === 415
    ) {
      const uniqueTitle = `${videoTitle} · ${Date.now().toString(36)}`;
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
    }

    const message =
      readBunnyMessage(intoVideoBody) ||
      `Bunny API ${intoVideoResponse.status}`;
    return { error: `Bunny Stream aktarımı başarısız: ${message}` };
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
