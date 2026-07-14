import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import { getHomeFeaturedPhotos } from "@/features/photo-likes/infrastructure/photo-like.repository";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { ProtectedImage } from "@/shared/components/protected-image";
import { routes } from "@/config/routes";

/** 6 en desktop (3×2); en móvil se ven en grilla de 2 columnas. */
const HOME_FEATURED_COUNT = 6;

export async function PopularPhotosSection() {
  const photos = await getHomeFeaturedPhotos(HOME_FEATURED_COUNT);

  if (photos.length === 0) return null;

  return (
    <section className="bg-surface-container-lowest px-margin-mobile py-section-compact md:px-margin-desktop">
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

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 md:gap-6">
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
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white sm:px-2 sm:text-xs">
                  #{index + 1}
                </span>
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white sm:px-2 sm:text-xs">
                  <ThumbsUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {photo.likeCount}
                </span>
              </div>
              <div className="space-y-0.5 p-3 sm:p-4">
                <p className="line-clamp-1 text-xs font-medium group-hover:underline sm:text-sm">
                  {photo.eventTitle}
                </p>
                <p className="text-[11px] text-on-surface-variant sm:text-xs">
                  Foto {formatPhotoNumber(photo.sortOrder)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href={routes.events}
            className="text-label-sm border-b border-white/20 pb-1 tracking-widest"
          >
            Ver todos los eventos
          </Link>
        </div>
      </div>
    </section>
  );
}
