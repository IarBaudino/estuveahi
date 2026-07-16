import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, MapPin, QrCode } from "lucide-react";
import { getEventBySlug } from "@/features/events/infrastructure/event.repository";
import { getEventPhotos } from "@/features/photos/infrastructure/photo-read.repository";
import { toPublicPhotos } from "@/domain/dto/public-photo";
import { PhotoGallery } from "@/features/photos/presentation/components/photo-gallery";
import { formatDate } from "@/shared/lib/utils";
import { EVENT_CATEGORY_LABELS } from "@/domain/enums/event-category";
import { Badge } from "@/shared/ui/badge";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { auth } from "@/infrastructure/auth";
import { getUserFavoriteIds } from "@/features/favorites/infrastructure/favorite.repository";
import { getUserLikedIds } from "@/features/photo-likes/infrastructure/photo-like.repository";
import { isListingCurrentlyActive } from "@/shared/lib/event-listing";
import { EventListingNotice } from "@/shared/components/event-listing-notice";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (
    !event ||
    event.status !== "published" ||
    event.isPublic === false ||
    !isListingCurrentlyActive(event.listingExpiresAt)
  ) {
    return { title: "Evento no encontrado" };
  }

  return {
    title: event.title,
    description: event.description ?? `Fotografías de ${event.title}`,
    openGraph: {
      title: event.title,
      description: event.description ?? undefined,
      url: `${siteConfig.url}${routes.event(slug)}`,
    },
  };
}

export default async function EventGalleryPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (
    !event ||
    event.status !== "published" ||
    event.isPublic === false ||
    !isListingCurrentlyActive(event.listingExpiresAt)
  ) {
    notFound();
  }

  const [photos, session] = await Promise.all([
    getEventPhotos(event.id),
    auth(),
  ]);

  const photosTruncated = event.photoCount > photos.length;

  const favoriteIds = session?.user?.id
    ? await getUserFavoriteIds(session.user.id)
    : new Set<string>();

  const likedIds = session?.user?.id
    ? await getUserLikedIds(session.user.id)
    : new Set<string>();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="mb-3">{EVENT_CATEGORY_LABELS[event.category]}</Badge>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="mt-2 text-zinc-500">
              por {event.photographer.displayName}
              {event.photographer.isVerified && " ✓"}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
            <QrCode className="h-4 w-4" />
            <span className="font-mono">{event.qrCode}</span>
          </div>
        </div>

        {event.description && (
          <p className="mt-4 max-w-3xl text-zinc-600 dark:text-zinc-400">
            {event.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(event.eventDate)}
          </span>
          {(event.venue || event.city) && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {[event.venue, event.city].filter(Boolean).join(", ")}
            </span>
          )}
          <span>
            {photos.length === event.photoCount
              ? `${event.photoCount} fotografías`
              : `${photos.length} de ${event.photoCount} fotografías`}
          </span>
        </div>

        <EventListingNotice
          listingExpiresAt={event.listingExpiresAt}
          className="mt-4"
          compact
        />
      </div>

      {photosTruncated && (
        <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Hay más fotos en este evento. Si no ves una imagen recién subida, esperá unos segundos y
          recargá la página.
        </p>
      )}

      {photos.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-surface-container px-6 py-12 text-center">
          <p className="text-lg font-medium">Galería en camino</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Las fotos se van a publicar pronto.
          </p>
        </div>
      ) : (
      <PhotoGallery
        photos={toPublicPhotos(photos)}
        favoriteIds={Array.from(favoriteIds)}
        likedIds={Array.from(likedIds)}
        isAuthenticated={!!session?.user}
      />
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
