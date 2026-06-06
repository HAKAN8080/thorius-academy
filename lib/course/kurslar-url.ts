export function buildKurslarUrl(options?: {
  page?: number;
  categorySlug?: string;
}): string {
  const params = new URLSearchParams();

  if (options?.categorySlug) {
    params.set("kategori", options.categorySlug);
  }

  if (options?.page && options.page > 1) {
    params.set("sayfa", String(options.page));
  }

  const query = params.toString();
  return query ? `/kurslar?${query}` : "/kurslar";
}

export function parseKurslarPage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}
