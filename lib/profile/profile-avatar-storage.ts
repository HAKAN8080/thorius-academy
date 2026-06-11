import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const PROFILE_MEDIA_BUCKET = "profile-media";
/** Kırpılmış JPEG çıktı üst sınırı */
export const PROFILE_AVATAR_MAX_BYTES = 512 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function hasJpegMagicBytes(buffer: Buffer): boolean {
  return (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
}

function hasPngMagicBytes(buffer: Buffer): boolean {
  return (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  );
}

function hasWebpMagicBytes(buffer: Buffer): boolean {
  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

export function validateProfileAvatarMeta(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Yalnızca JPG, PNG veya WebP yükleyebilirsiniz.";
  }

  if (file.size <= 0) {
    return "Boş dosya yüklenemez.";
  }

  if (file.size > PROFILE_AVATAR_MAX_BYTES) {
    return "Profil fotoğrafı en fazla 2 MB olabilir.";
  }

  const lower = file.name.toLowerCase();
  if (!/\.(jpe?g|png|webp)$/i.test(lower)) {
    return "Dosya uzantısı JPG, PNG veya WebP olmalıdır.";
  }

  return null;
}

export function validateProfileAvatarBuffer(
  buffer: Buffer,
  mimeType: string,
): string | null {
  if (mimeType === "image/jpeg" && !hasJpegMagicBytes(buffer)) {
    return "Dosya geçerli bir JPEG görseli değil.";
  }

  if (mimeType === "image/png" && !hasPngMagicBytes(buffer)) {
    return "Dosya geçerli bir PNG görseli değil.";
  }

  if (mimeType === "image/webp" && !hasWebpMagicBytes(buffer)) {
    return "Dosya geçerli bir WebP görseli değil.";
  }

  return null;
}

export function buildProfileAvatarStoragePath(userId: string): string {
  return `${userId}/avatar.jpg`;
}

export function getProfileMediaPublicUrl(path: string): string {
  const admin = getSupabaseAdmin();
  const { data } = admin.storage.from(PROFILE_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadProfileAvatarBuffer(
  path: string,
  buffer: Buffer,
): Promise<string> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.from(PROFILE_MEDIA_BUCKET).upload(path, buffer, {
    contentType: "image/jpeg",
    upsert: true,
    cacheControl: "3600",
  });

  if (error) {
    throw new Error(error.message);
  }

  const baseUrl = getProfileMediaPublicUrl(path);
  return `${baseUrl}?v=${Date.now()}`;
}

export function mapProfileAvatarUploadError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("bucket not found") || lower.includes("profile-media")) {
    return "Profil fotoğrafı depolaması henüz hazır değil. Lütfen yöneticiye bildirin (profile-media bucket).";
  }
  if (lower.includes("payload too large") || lower.includes("entity too large")) {
    return "Profil fotoğrafı çok büyük. Lütfen daha küçük bir görsel deneyin.";
  }
  if (lower.includes("invalid mime") || lower.includes("mime type")) {
    return "Desteklenmeyen dosya formatı. JPG, PNG veya WebP kullanın.";
  }
  return `Profil fotoğrafı yüklenemedi: ${message}`;
}
