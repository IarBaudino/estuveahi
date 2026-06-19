"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import type { Photo } from "@/domain/entities/photo";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { formatCurrency } from "@/shared/lib/utils";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { ProtectedImage } from "@/shared/components/protected-image";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { deletePhotoAction, updatePhotoPriceAction } from "@/features/photos/presentation/actions/photo.actions";
import { Trash2 } from "lucide-react";

interface PhotoPriceEditorProps {
  photos: Photo[];
  eventId: string;
}

export function PhotoPriceEditor({ photos, eventId }: PhotoPriceEditorProps) {
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      photos.map((p) => [
        p.id,
        p.priceCents != null ? String(p.priceCents / 100) : "",
      ]),
    ),
  );
  const [savingId, setSavingId] = useState<string | null>(null);

  const { executeAsync } = useAction(updatePhotoPriceAction, {
    onSuccess: () => router.refresh(),
  });

  const { executeAsync: deletePhoto, isExecuting: deleting } = useAction(
    deletePhotoAction,
    { onSuccess: () => router.refresh() },
  );

  async function savePrice(photoId: string) {
    const raw = prices[photoId]?.trim();
    const priceCents =
      raw === "" || raw === undefined
        ? null
        : Math.round(Number(raw) * 100);

    if (raw !== "" && (Number.isNaN(priceCents) || priceCents! < 0)) return;

    setSavingId(photoId);
    try {
      await executeAsync({ photoId, eventId, priceCents });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="flex gap-3 hairline-border p-3"
        >
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
            <ProtectedImage
              src={getSecureMediaUrl(photo.id, "thumbnail")}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
            <span className="absolute left-0 top-0 bg-black/70 px-1.5 py-0.5 text-[10px] font-mono text-white">
              {formatPhotoNumber(photo.sortOrder)}
            </span>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="truncate text-xs text-zinc-500">{photo.originalFilename}</p>
            {photo.priceCents != null && photo.priceCents > 0 && (
              <p className="text-sm font-medium">
                {formatCurrency(photo.priceCents, photo.currency)}
              </p>
            )}
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="Precio en $"
                className="h-8 text-sm"
                value={prices[photo.id] ?? ""}
                onChange={(e) =>
                  setPrices((p) => ({ ...p, [photo.id]: e.target.value }))
                }
              />
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                isLoading={savingId === photo.id}
                onClick={() => savePrice(photo.id)}
              >
                Guardar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="shrink-0 px-2"
                isLoading={deleting}
                onClick={() => {
                  if (
                    confirm(
                      `¿Eliminar la foto ${formatPhotoNumber(photo.sortOrder)}?`,
                    )
                  ) {
                    deletePhoto({ photoId: photo.id, eventId });
                  }
                }}
                aria-label="Eliminar foto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
