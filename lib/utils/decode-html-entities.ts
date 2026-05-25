/**
 * WordPress REST API and post_title often return HTML entities
 * (e.g. &#8211; for –, &amp; for &). React text nodes show them literally unless decoded.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) {
    return text;
  }

  let decoded = text.replace(/<[^>]*>/g, "");

  decoded = decoded.replace(/&#(\d+);/g, (_, code: string) => {
    const n = Number(code);
    return Number.isFinite(n) ? String.fromCodePoint(n) : `&#${code};`;
  });

  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
    const n = parseInt(hex, 16);
    return Number.isFinite(n) ? String.fromCodePoint(n) : `&#x${hex};`;
  });

  decoded = decoded
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

  return decoded.replace(/\s+/g, " ").trim();
}
