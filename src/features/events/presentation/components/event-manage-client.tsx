"use client";

import { useCallback, useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Event } from "@/domain/entities/event";
import type { Photo } from "@/domain/entities/photo";
import type { PhotoDTO } from "@/shared/lib/photo-serialization";
import { fromPhotoDTO } from "@/shared/lib/photo-serialization";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import {
  createEventSchema,
  type CreateEventInput,
} from "@/features/events/application/schemas/event.schema";
import { updateEventAction } from "@/features/events/presentation/actions/event.actions";
import { bulkUpdatePhotoPricesAction } from "@/features/photos/presentation/actions/photo.actions";
import { EventFormFields } from "@/features/events/presentation/components/event-form-fields";
import { EventActions } from "@/features/events/presentation/components/event-actions";
import { PhotoUploader } from "@/features/photos/presentation/components/photo-uploader";
import {
  PhotoPriceEditor,
  parsePhotoPricePesos,
} from "@/features/photos/presentation/components/photo-price-editor";
import { routes } from "@/config/routes";
import { QrCode } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

interface EventManageClientProps {
  event: Event;
  photos: Photo[];
  isOwner: boolean;
  canUpload: boolean;
  currentUserId: string;
}

function buildPriceDraft(photos: Photo[]): Record<string, string> {
  return Object.fromEntries(
    photos.map((photo) => [
      photo.id,
      photo.priceCents != null ? String(photo.priceCents / 100) : "",
    ]),
  );
}

export function EventManageClient({
  event,
  photos: initialPhotos,
  isOwner,
  canUpload,
  currentUserId,
}: EventManageClientProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [photoCount, setPhotoCount] = useState(event.photoCount);
  const [draftPrices, setDraftPrices] = useState<Record<string, string>>(() =>
    buildPriceDraft(initialPhotos),
  );
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const eventDate =
    event.eventDate instanceof Date
      ? event.eventDate.toISOString().slice(0, 10)
      : new Date(event.eventDate).toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: event.title,
      description: event.description ?? "",
      category: event.category,
      venue: event.venue ?? "",
      city: event.city ?? "",
      country: event.country,
      eventDate,
      isPublic: event.isPublic,
    },
  });

  const { executeAsync: updateEvent, isExecuting: savingEvent } =
    useAction(updateEventAction);
  const { executeAsync: bulkUpdatePrices, isExecuting: savingPrices } = useAction(
    bulkUpdatePhotoPricesAction,
  );

  const isSaving = savingEvent || savingPrices;

  useEffect(() => {
    setPhotos(initialPhotos);
    setPhotoCount(event.photoCount);
    setDraftPrices(buildPriceDraft(initialPhotos));
  }, [initialPhotos, event.id, event.photoCount]);

  const handlePhotoUploaded = useCallback((photo: PhotoDTO) => {
    const mapped = fromPhotoDTO(photo);
    setPhotos((current) => {
      if (current.some((item) => item.id === mapped.id)) {
        return current;
      }
      return [...current, mapped].sort((a, b) => a.sortOrder - b.sortOrder);
    });
    setDraftPrices((current) => ({
      ...current,
      [mapped.id]:
        mapped.priceCents != null ? String(mapped.priceCents / 100) : current[mapped.id] ?? "",
    }));
    setPhotoCount((count) => count + 1);
  }, []);

  const handlePhotoRemoved = useCallback((photoId: string) => {
    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
    setDraftPrices((current) => {
      const next = { ...current };
      delete next[photoId];
      return next;
    });
    setPhotoCount((count) => Math.max(0, count - 1));
  }, []);

  const handlePriceChange = useCallback((photoId: string, value: string) => {
    setDraftPrices((current) => ({ ...current, [photoId]: value }));
    setSaveMessage(null);
    setSaveError(null);
  }, []);

  const onSaveAll = handleSubmit(async (eventData) => {
    setSaveMessage(null);
    setSaveError(null);

    const priceUpdates: { photoId: string; priceCents: number | null }[] = [];

    for (const photo of photos) {
      const parsed = parsePhotoPricePesos(draftPrices[photo.id] ?? "");
      if (parsed === "invalid") {
        setSaveError(`Revisá el precio de la foto ${formatPhotoNumber(photo.sortOrder)}`);
        return;
      }
      if (parsed !== photo.priceCents) {
        priceUpdates.push({ photoId: photo.id, priceCents: parsed });
      }
    }

    if (isOwner) {
      const eventResult = await updateEvent({ id: event.id, ...eventData });
      if (eventResult?.serverError) {
        setSaveError(eventResult.serverError);
        return;
      }
    }

    if (priceUpdates.length > 0) {
      const pricesResult = await bulkUpdatePrices({
        eventId: event.id,
        prices: priceUpdates,
      });

      if (pricesResult?.serverError) {
        setSaveError(pricesResult.serverError);
        return;
      }

      if (pricesResult?.data?.photos) {
        for (const dto of pricesResult.data.photos) {
          const mapped = fromPhotoDTO(dto);
          setPhotos((current) =>
            current.map((item) => (item.id === mapped.id ? mapped : item)),
          );
        }
      }
    }

    setSaveMessage("Cambios guardados");
    router.refresh();
  });

  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${routes.qr(event.qrCode)}`;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-zinc-500">
            Estado: {event.status} · {photoCount} fotos
          </p>
          {event.status === "draft" && isOwner && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              Este evento está en borrador y no aparece en el catálogo público. Usá
              &quot;Publicar evento&quot; cuando esté listo.
            </p>
          )}
          {!isOwner && (
            <p className="mt-2 text-sm text-zinc-500">
              Evento colaborativo: podés subir tus fotos y gestionar solo las tuyas. Las ventas
              de cada foto van al fotógrafo que la subió.
            </p>
          )}
        </div>
        {isOwner && <EventActions eventId={event.id} status={event.status} />}
      </div>

      <form onSubmit={onSaveAll} className="mt-6 space-y-8">
        {isOwner && (
          <section className="hairline-border space-y-4 p-4">
            <h2 className="font-semibold">Información del evento</h2>
            <EventFormFields register={register} errors={errors} />
          </section>
        )}

        {isOwner && (
          <section className="hairline-border p-4">
            <div className="flex items-center gap-2 font-medium">
              <QrCode className="h-5 w-5" />
              Acceso QR
            </div>
            <p className="mt-2 font-mono text-sm">{event.qrCode}</p>
            <p className="mt-1 text-sm text-zinc-500 break-all">{qrUrl}</p>
            {event.status === "published" && (
              <Link href={routes.event(event.slug)} target="_blank" className="mt-3 inline-block">
                <Button type="button" variant="outline" size="sm">
                  Ver galería pública
                </Button>
              </Link>
            )}
          </section>
        )}

        {canUpload && (
          <section>
            <h2 className="text-lg font-semibold">Subir fotografías</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Las fotos se suben al instante. Los precios los editás abajo y guardás todo junto.
            </p>
            <div className="mt-4">
              <PhotoUploader eventId={event.id} onPhotoUploaded={handlePhotoUploaded} />
            </div>
          </section>
        )}

        {photos.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold">
              Fotografías ({photos.length})
              {!isOwner && (
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  — editás solo las tuyas
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Cada foto tiene un número (#1, #2…) que el cliente verá al pedirla.
            </p>
            <div className="mt-4">
              <PhotoPriceEditor
                photos={photos}
                eventId={event.id}
                prices={draftPrices}
                onPriceChange={handlePriceChange}
                onPhotoRemoved={handlePhotoRemoved}
                currentUserId={currentUserId}
                isEventOwner={isOwner}
              />
            </div>
          </section>
        )}

        {(isOwner || photos.some((p) => p.photographerId === currentUserId)) && (
          <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/90 p-4 backdrop-blur-md">
            <Button type="submit" size="lg" isLoading={isSaving}>
              Guardar cambios
            </Button>
            {saveMessage && <p className="text-sm text-emerald-500">{saveMessage}</p>}
            {saveError && <p className="text-sm text-red-500">{saveError}</p>}
          </div>
        )}
      </form>
    </div>
  );
}
