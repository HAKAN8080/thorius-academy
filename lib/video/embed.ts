export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

export function buildYouTubeEmbedUrl(urlOrEmbed: string): string | null {
  const videoId = extractYouTubeVideoId(urlOrEmbed);
  if (!videoId) {
    return null;
  }

  const embed = new URL(`https://www.youtube.com/embed/${videoId}`);
  embed.searchParams.set("enablejsapi", "1");
  if (typeof window !== "undefined") {
    embed.searchParams.set("origin", window.location.origin);
  }
  embed.searchParams.set("rel", "0");
  return embed.toString();
}

export function extractVimeoVideoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}

export function buildVimeoEmbedUrl(url: string): string | null {
  const videoId = extractVimeoVideoId(url);
  if (!videoId) {
    return null;
  }

  return `https://player.vimeo.com/video/${videoId}`;
}
