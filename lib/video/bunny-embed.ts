const BUNNY_EMBED_HOST = "iframe.mediadelivery.net";

function normalizeBunnyEmbedUrl(libraryId: string, videoId: string): string {
  const embed = new URL(`https://${BUNNY_EMBED_HOST}/embed/${libraryId}/${videoId}`);
  embed.searchParams.set("autoplay", "false");
  embed.searchParams.set("preload", "true");
  embed.searchParams.set("responsive", "true");
  return embed.toString();
}

export function buildBunnyEmbedUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) {
    return null;
  }

  const trimmed = url.trim();

  const iframeMatch = trimmed.match(
    /(?:https?:\/\/)?(?:iframe\.)?mediadelivery\.net\/(?:embed|play)\/(\d+)\/([a-f0-9-]+)/i,
  );
  if (iframeMatch) {
    return normalizeBunnyEmbedUrl(iframeMatch[1], iframeMatch[2]);
  }

  const playMatch = trimmed.match(
    /(?:https?:\/\/)?video\.bunnycdn\.com\/play\/(\d+)\/([a-f0-9-]+)/i,
  );
  if (playMatch) {
    return normalizeBunnyEmbedUrl(playMatch[1], playMatch[2]);
  }

  return null;
}

export function isDirectMediaFileUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) {
    return false;
  }

  return /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(url.trim());
}
