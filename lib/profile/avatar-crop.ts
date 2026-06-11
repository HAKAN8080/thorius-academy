import type { Area } from "react-easy-crop";

export const PROFILE_AVATAR_OUTPUT_SIZE = 400;
export const PROFILE_AVATAR_PREVIEW_SIZE = 160;
export const PROFILE_AVATAR_JPEG_QUALITY = 0.88;
export const PROFILE_AVATAR_SOURCE_MAX_BYTES = 10 * 1024 * 1024;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Görsel yüklenemedi.")));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = src;
  });
}

export async function createCroppedAvatarBlob(
  imageSrc: string,
  crop: Area,
  outputSize = PROFILE_AVATAR_OUTPUT_SIZE,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Görsel işlenemedi.");
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Görsel dönüştürülemedi."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      PROFILE_AVATAR_JPEG_QUALITY,
    );
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Dosya okunamadı."));
    });
    reader.addEventListener("error", () => reject(new Error("Dosya okunamadı.")));
    reader.readAsDataURL(file);
  });
}

export function validateAvatarSourceFile(file: File): string | null {
  const mime = resolveAvatarSourceMime(file);
  if (!mime) {
    return "Yalnızca JPG, PNG veya WebP yükleyebilirsiniz.";
  }

  if (file.size <= 0) {
    return "Boş dosya yüklenemez.";
  }

  if (file.size > PROFILE_AVATAR_SOURCE_MAX_BYTES) {
    return "Kaynak görsel en fazla 10 MB olabilir.";
  }

  return null;
}

export function resolveAvatarSourceMime(file: File): string | null {
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (file.type && allowed.has(file.type)) {
    return file.type;
  }

  const lower = file.name.toLowerCase();
  if (/\.jpe?g$/.test(lower)) return "image/jpeg";
  if (/\.png$/.test(lower)) return "image/png";
  if (/\.webp$/.test(lower)) return "image/webp";
  return null;
}
