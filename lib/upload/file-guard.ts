export const LESSON_VIDEO_MAX_BYTES = 500 * 1024 * 1024;
export const LESSON_PDF_MAX_BYTES = 20 * 1024 * 1024;
export const INSTRUCTOR_UPLOADS_PER_HOUR = 15;

const LESSON_VIDEO_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const LESSON_PDF_MIME = new Set(["application/pdf"]);

function hasPdfMagicBytes(buffer: Buffer): boolean {
  return buffer.length >= 4 && buffer.subarray(0, 4).toString("ascii") === "%PDF";
}

function hasMp4MagicBytes(buffer: Buffer): boolean {
  return (
    buffer.length >= 12 &&
    buffer.subarray(4, 8).toString("ascii") === "ftyp"
  );
}

function hasWebmMagicBytes(buffer: Buffer): boolean {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  );
}

function hasQuickTimeMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const brand = buffer.subarray(4, 8).toString("ascii");
  return brand === "ftyp" || brand === "moov" || brand === "mdat";
}

export function validateLessonVideoMeta(
  file: Pick<File, "type" | "size" | "name">,
): string | null {
  if (!LESSON_VIDEO_MIME.has(file.type)) {
    return "Yalnızca MP4, WebM veya MOV video yükleyebilirsiniz.";
  }

  if (file.size <= 0) {
    return "Boş dosya yüklenemez.";
  }

  if (file.size > LESSON_VIDEO_MAX_BYTES) {
    return "Video en fazla 500 MB olabilir.";
  }

  const lower = file.name.toLowerCase();
  if (!/\.(mp4|webm|mov)$/i.test(lower)) {
    return "Video dosya uzantısı MP4, WebM veya MOV olmalıdır.";
  }

  return null;
}

export function validateLessonVideoBuffer(
  buffer: Buffer,
  mimeType: string,
): string | null {
  if (mimeType === "application/pdf") {
    return "PDF dosyası video alanına yüklenemez.";
  }

  if (mimeType === "video/webm") {
    if (!hasWebmMagicBytes(buffer)) {
      return "Dosya geçerli bir WebM videosu değil.";
    }
    return null;
  }

  if (mimeType === "video/quicktime" || mimeType === "video/mp4") {
    if (!hasMp4MagicBytes(buffer) && !hasQuickTimeMagicBytes(buffer)) {
      return "Dosya geçerli bir MP4/MOV videosu değil.";
    }
    return null;
  }

  return "Desteklenmeyen video formatı.";
}

export function validateLessonPdfMeta(
  file: Pick<File, "type" | "size" | "name">,
): string | null {
  if (!LESSON_PDF_MIME.has(file.type)) {
    return "Yalnızca PDF dosyası yükleyebilirsiniz.";
  }

  if (file.size <= 0) {
    return "Boş dosya yüklenemez.";
  }

  if (file.size > LESSON_PDF_MAX_BYTES) {
    return "PDF en fazla 20 MB olabilir.";
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return "Dosya uzantısı .pdf olmalıdır.";
  }

  return null;
}

export function validateLessonPdfBuffer(buffer: Buffer): string | null {
  if (!hasPdfMagicBytes(buffer)) {
    return "Dosya geçerli bir PDF değil.";
  }
  return null;
}

export function sanitizeFileBaseName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  const safe = base
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return safe || "dosya";
}
