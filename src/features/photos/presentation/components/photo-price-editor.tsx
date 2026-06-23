"use client";

import { useAction } from "next-safe-action/hooks";
import type { Photo } from "@/domain/entities/photo";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { ProtectedImage } from "@/shared/components/protected-image";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { deletePhotoAction } from "@/features/photos/presentation/actions/photo.actions";
import { Trash2 } from "lucide-react";

interface PhotoPriceEditorProps {
  photos: Photo[];
  eventId: string;
  prices: Record<string, string>;
  onPriceChange: (photoId: string, value: string) => void;
  onPhotoRemoved?: (photoId: string) => void;
  currentUserId: string;
  isEventOwner: boolean;
}

export function PhotoPriceEditor({
  photos,
  eventId,
  prices,
  onPriceChange,
  onPhotoRemoved,
  currentUserId,
  isEventOwner,
}: PhotoPriceEditorProps) {
  const { executeAsync: deletePhoto, isExecuting: deleting } = useAction(deletePhotoAction);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => {
        const isMine = photo.photographerId === currentUserId;
        const canManage = isEventOwner || isMine;

        return (
        <div key={photo.id} className="flex gap-3 hairline-border p-3">
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
            <div className="flex items-center gap-2">
              <p className="truncate text-xs text-zinc-500">{photo.originalFilename}</p>
              {isMine ? (
                <span className="shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Tuya
                </span>
              ) : (
                <span className="shrink-0 rounded bg-zinc-500/15 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                  Otrx fotografx
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="Precio en $"
                className="h-8 text-sm"
                value={prices[photo.id] ?? ""}
                onChange={(e) => onPriceChange(photo.id, e.target.value)}
                disabled={!canManage}
              />
              {canManage && (
              <Button
                size="sm"
                variant="destructive"
                className="shrink-0 px-2"
                isLoading={deleting}
                onClick={async () => {
                  if (
                    confirm(`¿Eliminar la foto ${formatPhotoNumber(photo.sortOrder)}?`)
                  ) {
                    const result = await deletePhoto({ photoId: photo.id, eventId });
                    if (result?.serverError) {
                      window.alert(result.serverError);
                      return;
                    }
                    onPhotoRemoved?.(photo.id);
                  }
                }}
                aria-label="Eliminar foto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              )}
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}

export function parsePhotoPricePesos(raw: string): number | null | "invalid" {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const pesos = Number(trimmed);
  if (Number.isNaN(pesos) || pesos < 0) return "invalid";
  return Math.round(pesos * 100);
}
