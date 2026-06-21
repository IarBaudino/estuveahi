"use client";

import { useCallback, useEffect, useState } from "react";
import type { Event } from "@/domain/entities/event";
import type { Photo } from "@/domain/entities/photo";
import type { PhotoDTO } from "@/shared/lib/photo-serialization";
import { fromPhotoDTO } from "@/shared/lib/photo-serialization";
import { EventEditForm } from "@/features/events/presentation/components/event-edit-form";
import { EventActions } from "@/features/events/presentation/components/event-actions";
import { PhotoUploader } from "@/features/photos/presentation/components/photo-uploader";
import { PhotoPriceEditor } from "@/features/photos/presentation/components/photo-price-editor";
import { routes } from "@/config/routes";
import { QrCode } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

interface EventManageClientProps {
  event: Event;
  photos: Photo[];
}

export function EventManageClient({ event, photos: initialPhotos }: EventManageClientProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [photoCount, setPhotoCount] = useState(event.photoCount);

  useEffect(() => {
    setPhotos(initialPhotos);
    setPhotoCount(event.photoCount);
  }, [initialPhotos, event.id, event.photoCount]);

  const handlePhotoUploaded = useCallback((photo: PhotoDTO) => {
    const mapped = fromPhotoDTO(photo);
    setPhotos((current) => {
      if (current.some((item) => item.id === mapped.id)) {
        return current;
      }
      return [...current, mapped].sort((a, b) => a.sortOrder - b.sortOrder);
    });
    setPhotoCount((count) => count + 1);
  }, []);

  const handlePhotoRemoved = useCallback((photoId: string) => {
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
    setPhotoCount((count) => Math.max(0, count - 1));
  }, []);

  const handlePhotoUpdated = useCallback((photo: PhotoDTO) => {
    const mapped = fromPhotoDTO(photo);
    setPhotos((current) =>
      current.map((item) => (item.id === mapped.id ? mapped : item)),
    );
  }, []);

  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${routes.qr(event.qrCode)}`;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-zinc-500">
            Estado: {event.status} · {photoCount} fotos
          </p>
          {event.status === "draft" && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              Este evento está en borrador y no aparece en el catálogo público. Usá
              &quot;Publicar evento&quot; cuando esté listo.
            </p>
          )}
        </div>
        <EventActions eventId={event.id} status={event.status} />
      </div>

      <div className="mt-6">
        <EventEditForm event={event} />
      </div>

      <div className="mt-6 hairline-border p-4">
        <div className="flex items-center gap-2 font-medium">
          <QrCode className="h-5 w-5" />
          Acceso QR
        </div>
        <p className="mt-2 font-mono text-sm">{event.qrCode}</p>
        <p className="mt-1 text-sm text-zinc-500 break-all">{qrUrl}</p>
        {event.status === "published" && (
          <Link href={routes.event(event.slug)} target="_blank" className="mt-3 inline-block">
            <Button variant="outline" size="sm">
              Ver galería pública
            </Button>
          </Link>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Subir fotografías</h2>
        <div className="mt-4">
          <PhotoUploader eventId={event.id} onPhotoUploaded={handlePhotoUploaded} />
        </div>
      </div>

      {photos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Fotografías ({photos.length})</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Cada foto tiene un número (#1, #2…) que el cliente verá al pedirla.
          </p>
          <div className="mt-4">
            <PhotoPriceEditor
              photos={photos}
              eventId={event.id}
              onPhotoRemoved={handlePhotoRemoved}
              onPhotoUpdated={handlePhotoUpdated}
            />
          </div>
        </div>
      )}
    </div>
  );
}
