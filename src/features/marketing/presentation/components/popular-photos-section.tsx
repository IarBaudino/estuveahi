import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import { getTopPhotosByLikes } from "@/features/photo-likes/infrastructure/photo-like.repository";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { ProtectedImage } from "@/shared/components/protected-image";
import { routes } from "@/config/routes";

const HOME_RANKING_LIMIT = 8;

export async function PopularPhotosSection() {
  const photos = await getTopPhotosByLikes(HOME_RANKING_LIMIT, {
    minLikes: 1,
    onlyActiveEvents: true,
  });

  if (photos.length === 0) return null;

  return (
    <section className="px-margin-mobile py-section-compact md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <div className="mb-8 flex items-end justify-between md:mb-10">
          <div>
            <span className="text-label-sm mb-4 block tracking-[0.3em] text-on-surface-variant/50">
              Ranking
            </span>
            <h2 className="text-headline-lg">Fotos más queridas</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Las imágenes con más likes de la comunidad
            </p>
          </div>
          <Link
            href={routes.events}
            className="text-label-sm hidden border-b border-white/20 pb-1 tracking-widest transition-all hover:border-white md:block"
          >
            Ver todos los eventos
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <Link
              key={photo.id}
              href={routes.event(photo.eventSlug)}
              className="group overflow-hidden hairline-border bg-surface-container"
            >
              <div className="relative aspect-square overflow-hidden bg-zinc-900">
                <ProtectedImage
                  src={getSecureMediaUrl(photo.id, "thumbnail")}
                  alt={`Foto ${formatPhotoNumber(photo.sortOrder)} de ${photo.eventTitle}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white">
                  #{index + 1}
                </span>
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                  <ThumbsUp className="h-3 w-3" />
                  {photo.likeCount}
                </span>
              </div>
              <div className="space-y-1 p-3">
                <p className="line-clamp-1 text-sm font-medium group-hover:underline">
                  {photo.eventTitle}
                </p>
                <p className="text-xs text-on-surface-variant">
                  Foto {formatPhotoNumber(photo.sortOrder)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
