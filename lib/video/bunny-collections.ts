import {
  extractBunnyVideoId,
  getBunnyStreamConfig,
  readBunnyMessage,
} from "@/lib/video/bunny-stream";

const BUNNY_VIDEO_API = "https://video.bunnycdn.com";

export interface BunnyCourseContext {
  courseTitle: string;
  courseSlug?: string | null;
  wpCourseId?: number | null;
}

interface BunnyCollectionItem {
  guid?: string;
  Guid?: string;
  name?: string;
  Name?: string;
}

function collectionIdOf(item: BunnyCollectionItem | null | undefined): string | undefined {
  return extractBunnyVideoId(item);
}

function collectionNameOf(item: BunnyCollectionItem | null | undefined): string | undefined {
  const name = item?.name ?? item?.Name;
  return typeof name === "string" && name.trim() ? name.trim() : undefined;
}

export function buildBunnyCollectionName(context: BunnyCourseContext): string {
  const title = context.courseTitle.trim() || "Thorius Kurs";
  const tag = context.courseSlug?.trim()
    ? context.courseSlug.trim()
    : context.wpCourseId
      ? `wp-${context.wpCourseId}`
      : "genel";

  return `${title} [${tag}]`.slice(0, 120);
}

export function buildBunnyVideoTitle(
  context: BunnyCourseContext,
  lessonTitle: string,
): string {
  const course = context.courseTitle.trim() || "Thorius Kurs";
  const lesson = lessonTitle.trim() || "Ders";
  return `${course} — ${lesson}`.slice(0, 180);
}

async function bunnyStreamFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; body: T | null }> {
  const config = getBunnyStreamConfig();
  if (!config) {
    return { ok: false, status: 0, body: null };
  }

  const response = await fetch(`${BUNNY_VIDEO_API}${path}`, {
    ...init,
    headers: {
      AccessKey: config.apiKey,
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(30_000),
  });

  const body = (await response.json().catch(() => null)) as T | null;
  return { ok: response.ok, status: response.status, body };
}

export async function ensureBunnyCollectionForCourse(
  context: BunnyCourseContext,
): Promise<{ collectionId: string; collectionName: string } | { error: string }> {
  const config = getBunnyStreamConfig();
  if (!config) {
    return { error: "Bunny Stream yapılandırılmamış." };
  }

  const collectionName = buildBunnyCollectionName(context);

  try {
    const search = encodeURIComponent(
      context.courseSlug?.trim() || String(context.wpCourseId ?? ""),
    );
    const list = await bunnyStreamFetch<{
      items?: BunnyCollectionItem[];
      Items?: BunnyCollectionItem[];
    }>(
      `/library/${config.libraryId}/collections?page=1&itemsPerPage=100&search=${search}`,
      { method: "GET" },
    );

    const listItems = list.body?.items ?? list.body?.Items ?? [];
    const existing = listItems.find(
      (item) => collectionNameOf(item) === collectionName,
    );
    const existingId = collectionIdOf(existing);
    if (existingId) {
      return { collectionId: existingId, collectionName };
    }

    const created = await bunnyStreamFetch<BunnyCollectionItem>(
      `/library/${config.libraryId}/collections`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: collectionName }),
      },
    );

    const createdId = collectionIdOf(created.body);
    if (!created.ok || !createdId) {
      const detail =
        readBunnyMessage(created.body) ||
        `Bunny collection oluşturulamadı (${created.status}).`;
      return { error: detail };
    }

    return { collectionId: createdId, collectionName };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: `Bunny collection hatası: ${message}` };
  }
}

export async function resolveBunnyCourseUploadTarget(
  context: BunnyCourseContext,
  lessonTitle: string,
): Promise<
  | { videoTitle: string; collectionId: string; collectionName: string }
  | { error: string }
> {
  const collection = await ensureBunnyCollectionForCourse(context);
  if ("error" in collection) {
    return collection;
  }

  return {
    videoTitle: buildBunnyVideoTitle(context, lessonTitle),
    collectionId: collection.collectionId,
    collectionName: collection.collectionName,
  };
}
