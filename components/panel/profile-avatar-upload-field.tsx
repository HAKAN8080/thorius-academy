"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Cropper, { type Area } from "react-easy-crop";
import { User } from "lucide-react";
import { toast } from "sonner";
import { uploadProfileAvatar } from "@/lib/actions/profile";
import {
  createCroppedAvatarBlob,
  PROFILE_AVATAR_OUTPUT_SIZE,
  PROFILE_AVATAR_PREVIEW_SIZE,
  readFileAsDataUrl,
  validateAvatarSourceFile,
} from "@/lib/profile/avatar-crop";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileAvatarUploadFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
  previewAlt?: string;
  disabled?: boolean;
}

export function ProfileAvatarUploadField({
  value,
  onChange,
  previewAlt = "Profil fotoğrafı",
  disabled = false,
}: ProfileAvatarUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  function resetCropState() {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const validationError = validateAvatarSourceFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImageSrc(dataUrl);
      setCropOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dosya okunamadı.";
      toast.error(message);
    }
  }

  function handleCropConfirm() {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }

    startTransition(async () => {
      try {
        const blob = await createCroppedAvatarBlob(imageSrc, croppedAreaPixels);
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
        const formData = new FormData();
        formData.set("file", file);

        const result = await uploadProfileAvatar(formData);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }

        onChange(result.url);
        setCropOpen(false);
        resetCropState();
        toast.success("Profil fotoğrafı yüklendi");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Profil fotoğrafı yüklenemedi.";
        toast.error(message);
      }
    });
  }

  return (
    <div className="space-y-3">
      <Label>Profil Fotoğrafı</Label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="relative shrink-0 overflow-hidden rounded-full border-2 border-primary-100 bg-primary-50"
          style={{
            width: PROFILE_AVATAR_PREVIEW_SIZE,
            height: PROFILE_AVATAR_PREVIEW_SIZE,
          }}
        >
          {value ? (
            <Image
              src={value}
              alt={previewAlt}
              fill
              className="object-cover"
              sizes={`${PROFILE_AVATAR_PREVIEW_SIZE}px`}
              unoptimized={value.startsWith("blob:")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-primary-300">
              <User
                className="h-16 w-16"
                aria-hidden
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="hidden"
              disabled={disabled || isPending}
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              disabled={disabled || isPending}
              onClick={() => inputRef.current?.click()}
            >
              {isPending ? "Yükleniyor..." : value ? "Fotoğrafı Değiştir" : "Fotoğraf Seç"}
            </Button>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                disabled={disabled || isPending}
                onClick={() => onChange(null)}
                className="text-red-600 hover:text-red-700"
              >
                Kaldır
              </Button>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-primary-500">
            Kare kırpma uygulanır; tüm profil fotoğrafları{" "}
            {PROFILE_AVATAR_OUTPUT_SIZE}×{PROFILE_AVATAR_OUTPUT_SIZE} px olarak
            kaydedilir. JPG, PNG veya WebP · kaynak dosya en fazla 10 MB.
          </p>
        </div>
      </div>

      <Dialog
        open={cropOpen}
        onOpenChange={(open) => {
          setCropOpen(open);
          if (!open) {
            resetCropState();
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Profil fotoğrafını kırp</DialogTitle>
            <DialogDescription>
              Sürükleyerek konumlandırın, yakınlaştırın. Görsel kare olarak{" "}
              {PROFILE_AVATAR_OUTPUT_SIZE}×{PROFILE_AVATAR_OUTPUT_SIZE} px boyutuna
              getirilir.
            </DialogDescription>
          </DialogHeader>

          <div className="relative h-72 w-full overflow-hidden rounded-xl bg-[#0B1E3F]">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar-zoom" className="text-xs text-primary-500">
              Yakınlaştır
            </Label>
            <input
              id="avatar-zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-[#D4AF37]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => {
                setCropOpen(false);
                resetCropState();
              }}
            >
              İptal
            </Button>
            <Button
              type="button"
              disabled={isPending || !croppedAreaPixels}
              className="bg-[#D4AF37] text-[#0B1E3F] hover:bg-[#c4a030]"
              onClick={handleCropConfirm}
            >
              {isPending ? "Yükleniyor..." : "Kırp ve yükle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
