import Link from "next/link";
import type { EventWithPhotographer } from "@/domain/entities/event";
import { EVENT_CATEGORY_LABELS } from "@/domain/enums/event-category";
import { formatDate } from "@/shared/lib/utils";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { routes } from "@/config/routes";
import { getEventPhotos } from "@/features/photos/infrastructure/photo-read.repository";
import { MaterialIcon } from "@/shared/components/icon";
import { ProtectedImage } from "@/shared/components/protected-image";

export async function EventCard({
  event,
  colorCover = false,
}: {
  event: EventWithPhotographer;
  colorCover?: boolean;
}) {
  const photos = await getEventPhotos(event.id, 1);
  const coverPhotoId = photos[0]?.id;

  return (
    <Link href={routes.event(event.slug)} className="group block">
      <article className="overflow-hidden hairline-border transition-colors hover:bg-white/5">
        <div className="relative aspect-[16/10] bg-surface-container">
          {coverPhotoId ? (
            <ProtectedImage
              src={getSecureMediaUrl(coverPhotoId, "thumbnail")}
              alt={event.title}
              fill
              className={
                colorCover
                  ? "object-cover transition-transform duration-700 group-hover:scale-105"
                  : "grayscale-filter object-cover transition-transform duration-700 group-hover:scale-105"
              }
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-on-surface-variant/40">
              <MaterialIcon name="photo_library" className="text-5xl" />
            </div>
          )}
          <div className="absolute left-3 top-3 z-20">
            <span className="text-label-sm bg-black/60 px-2 py-1 tracking-widest text-primary backdrop-blur-sm">
              {EVENT_CATEGORY_LABELS[event.category]}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-headline-md line-clamp-1 group-hover:underline">
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            por {event.photographer.displayName}
            {event.photographer.isVerified && " ✓"}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-caption text-on-surface-variant/70">
            <span>{formatDate(event.eventDate)}</span>
            {event.city && <span>{event.city}</span>}
            <span>{event.photoCount} fotos</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
