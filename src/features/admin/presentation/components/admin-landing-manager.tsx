"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import {
  LANDING_IMAGE_KEYS,
  LANDING_IMAGE_LABELS,
  type LandingGrayscale,
  type LandingImages,
  type LandingImageKey,
} from "@/config/landing.defaults";
import {
  resetLandingImageAction,
  updateLandingGrayscaleAction,
  uploadLandingImageAction,
} from "@/features/admin/presentation/actions/landing.actions";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface AdminLandingManagerProps {
  images: LandingImages;
  grayscale: LandingGrayscale;
}

export function AdminLandingManager({ images, grayscale: initialGrayscale }: AdminLandingManagerProps) {
  const router = useRouter();
  const fileRefs = useRef<Partial<Record<LandingImageKey, HTMLInputElement | null>>>({});
  const [grayscale, setGrayscale] = useState<LandingGrayscale>(initialGrayscale);
  const [uploadGrayscale, setUploadGrayscale] = useState<Record<LandingImageKey, boolean>>(() =>
    Object.fromEntries(LANDING_IMAGE_KEYS.map((key) => [key, initialGrayscale[key]])) as Record<
      LandingImageKey,
      boolean
    >,
  );

  const refresh = () => router.refresh();

  const { execute: upload, isExecuting: uploading } = useAction(uploadLandingImageAction, {
    onSuccess: () => refresh(),
  });

  const { execute: updateGrayscale, isExecuting: updatingGrayscale } = useAction(
    updateLandingGrayscaleAction,
    {
      onSuccess: ({ input }) => {
        if (input) {
          setGrayscale((prev) => ({ ...prev, [input.key]: input.grayscale }));
          setUploadGrayscale((prev) => ({ ...prev, [input.key]: input.grayscale }));
        }
        refresh();
      },
    },
  );

  const { execute: reset, isExecuting: resetting } = useAction(resetLandingImageAction, {
    onSuccess: refresh,
  });

  async function handleFileChange(key: LandingImageKey, file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
    if (file.size > 8 * 1024 * 1024) return;

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    upload({
      key,
      mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
      fileBase64: base64,
      grayscale: uploadGrayscale[key],
    });
  }

  function handleGrayscaleChange(key: LandingImageKey, value: boolean) {
    setUploadGrayscale((prev) => ({ ...prev, [key]: value }));
    updateGrayscale({ key, grayscale: value });
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {LANDING_IMAGE_KEYS.map((key) => (
        <article key={key} className="overflow-hidden hairline-border bg-surface-container">
          <div className="relative aspect-[16/10] bg-black">
            <Image
              src={images[key]}
              alt={LANDING_IMAGE_LABELS[key]}
              fill
              unoptimized
              className={cn("object-cover", grayscale[key] && "grayscale")}
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <div className="space-y-3 p-4">
            <h3 className="text-sm font-medium">{LANDING_IMAGE_LABELS[key]}</h3>
            <p className="truncate text-xs text-on-surface-variant">{images[key]}</p>
            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-on-surface-variant">Estilo al publicar</legend>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`style-${key}`}
                    checked={!uploadGrayscale[key]}
                    disabled={updatingGrayscale}
                    onChange={() => handleGrayscaleChange(key, false)}
                  />
                  Color
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`style-${key}`}
                    checked={uploadGrayscale[key]}
                    disabled={updatingGrayscale}
                    onChange={() => handleGrayscaleChange(key, true)}
                  />
                  Blanco y negro
                </label>
              </div>
            </fieldset>
            <div className="flex flex-wrap gap-2">
              <input
                ref={(el) => {
                  fileRefs.current[key] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileChange(key, file);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                isLoading={uploading}
                onClick={() => fileRefs.current[key]?.click()}
              >
                Subir imagen
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                isLoading={resetting}
                onClick={() => {
                  if (confirm(`¿Restaurar imagen por defecto de "${LANDING_IMAGE_LABELS[key]}"?`)) {
                    reset({ key });
                  }
                }}
              >
                Restaurar
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
