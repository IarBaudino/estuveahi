"use client";

import { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import {
  LANDING_IMAGE_KEYS,
  LANDING_IMAGE_LABELS,
  type LandingImages,
  type LandingImageKey,
} from "@/config/landing.defaults";
import {
  resetLandingImageAction,
  uploadLandingImageAction,
} from "@/features/admin/presentation/actions/landing.actions";
import { Button } from "@/shared/ui/button";

interface AdminLandingManagerProps {
  images: LandingImages;
}

export function AdminLandingManager({ images }: AdminLandingManagerProps) {
  const router = useRouter();
  const fileRefs = useRef<Partial<Record<LandingImageKey, HTMLInputElement | null>>>({});

  const refresh = () => router.refresh();

  const { execute: upload, isExecuting: uploading } = useAction(uploadLandingImageAction, {
    onSuccess: refresh,
  });

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
    });
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
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <div className="space-y-3 p-4">
            <h3 className="text-sm font-medium">{LANDING_IMAGE_LABELS[key]}</h3>
            <p className="truncate text-xs text-on-surface-variant">{images[key]}</p>
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
