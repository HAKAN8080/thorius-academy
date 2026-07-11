const EBOOK_PDF_MAX_BYTES = 100 * 1024 * 1024;

export async function validateEbookPdfFileClient(
  file: File,
): Promise<string | null> {
  if (file.size <= 0) {
    return "Bos dosya yuklenemez.";
  }

  if (file.size > EBOOK_PDF_MAX_BYTES) {
    return "E-kitap PDF en fazla 100 MB olabilir.";
  }

  const header = await file.slice(0, 4).text();
  if (header !== "%PDF") {
    return "Dosya gecerli bir PDF degil.";
  }

  return null;
}
