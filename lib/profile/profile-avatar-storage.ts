import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const PROFILE_MEDIA_BUCKET = "profile-media";
export const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

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

export function buildProfileAvatarStoragePath(
  userId: string,
  mimeType: string,
): string {
  const ext = EXTENSION_BY_MIME[mimeType] ?? "jpg";
  return `${userId}/avatar.${ext}`;
}

export function getProfileMediaPublicUrl(path: string): string {
  const admin = getSupabaseAdmin();
  const { data } = admin.storage.from(PROFILE_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadProfileAvatarBuffer(
  path: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.from(PROFILE_MEDIA_BUCKET).upload(path, buffer, {
    contentType: mimeType,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  return getProfileMediaPublicUrl(path);
}
