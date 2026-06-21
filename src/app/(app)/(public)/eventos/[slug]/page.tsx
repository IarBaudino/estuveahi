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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Evento no encontrado" };

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

  if (!event || event.status !== "published" || event.isPublic === false) {
    notFound();
  }

  const [photos, session] = await Promise.all([
    getEventPhotos(event.id),
    auth(),
  ]);

  const favoriteIds = session?.user?.id
    ? await getUserFavoriteIds(session.user.id)
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
          <span>{event.photoCount} fotografías</span>
        </div>
      </div>

      <PhotoGallery
        photos={toPublicPhotos(photos)}
        favoriteIds={Array.from(favoriteIds)}
        isAuthenticated={!!session?.user}
      />
    </div>
  );
}

export const revalidate = 60;
