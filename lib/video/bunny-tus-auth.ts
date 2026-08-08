import { createHash } from "node:crypto";
import {
  getBunnyStreamConfig,
  buildBunnyPlayUrl,
  extractBunnyVideoId,
  readBunnyMessage,
} from "@/lib/video/bunny-stream";

const BUNNY_VIDEO_API = "https://video.bunnycdn.com";
const TUS_UPLOAD_ENDPOINT = "https://video.bunnycdn.com/tusupload";
const TUS_AUTH_TTL_SECONDS = 6 * 60 * 60;

export function buildBunnyTusSignature(
  libraryId: string,
  apiKey: string,
  expirationUnix: number,
  videoId: string,
): string {
  return createHash("sha256")
    .update(`${libraryId}${apiKey}${expirationUnix}${videoId}`)
    .digest("hex");
}

export async function createBunnyVideoUploadSession(
  title: string,
  options?: { collectionId?: string },
): Promise<
  | {
      libraryId: string;
      videoId: string;
      playUrl: string;
      tusEndpoint: string;
      authorizationSignature: string;
      authorizationExpire: number;
    }
  | { error: string }
> {
  const config = getBunnyStreamConfig();
  if (!config) {
    return {
      error:
        "Bunny Stream yapılandırılmamış (BUNNY_LIBRARY_ID / BUNNY_API_KEY).",
    };
  }

  try {
    const createResponse = await fetch(
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
          ...(options?.collectionId
            ? { collectionId: options.collectionId }
            : {}),
        }),
        signal: AbortSignal.timeout(30_000),
      },
    );

    const body = (await createResponse.json().catch(() => null)) as unknown;
    const videoId = extractBunnyVideoId(body);

    if (!createResponse.ok || !videoId) {
      const message =
        readBunnyMessage(body) ||
        (createResponse.ok
          ? "Bunny Stream yanıtında video kimliği yok."
          : `Bunny video oluşturulamadı (${createResponse.status})`);
      return { error: message };
    }

    const expirationUnix = Math.floor(Date.now() / 1000) + TUS_AUTH_TTL_SECONDS;
    const signature = buildBunnyTusSignature(
      config.libraryId,
      config.apiKey,
      expirationUnix,
      videoId,
    );

    return {
      libraryId: config.libraryId,
      videoId,
      playUrl: buildBunnyPlayUrl(config.libraryId, videoId),
      tusEndpoint: TUS_UPLOAD_ENDPOINT,
      authorizationSignature: signature,
      authorizationExpire: expirationUnix,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: `Bunny upload oturumu açılamadı: ${message}` };
  }
}
