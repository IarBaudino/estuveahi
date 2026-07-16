import Link from "next/link";
import Image from "next/image";
import { searchPublicEvents } from "@/features/events/infrastructure/event.repository";
import { EVENT_CATEGORY_LABELS } from "@/domain/enums/event-category";
import { formatEventDate } from "@/shared/lib/utils";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { routes } from "@/config/routes";
import { getEventPhotos } from "@/features/photos/infrastructure/photo-read.repository";
import { ProtectedImage } from "@/shared/components/protected-image";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBj8-NIDsvIc5_94Ha-x7LzHsNh1LihHHqv-wFpJ72UmdcbSTzp0trQVvHRQYEA-dHOxpGOC6BfmPLatFDecBejxIs-dPGmwiyMEDTBiqYMZejt3StocqWf-p8esuguN99f3bDOmkv-tMqj3R1pgVBHvUY1dHW_D2T4xLFAgLjKA4fu2reOsxxce6vPTUs7OgC0FByFRRk_cwR4y_Mk1KLTVh7gVJYnfo3nOSjae0MG0v1kJmIKairhBgqEvIcoV13QlSehGCoPgqc";

export async function RecentEventsSection() {
  try {
    const { events } = await searchPublicEvents({ page: 1, limit: 6 });

    if (events.length === 0) return null;

    const eventsWithCovers = await Promise.all(
      events.map(async (event) => {
        const photos = await getEventPhotos(event.id, 1);
        return { event, coverPhotoId: photos[0]?.id };
      }),
    );

    return (
    <section className="bg-surface-container-lowest px-margin-mobile py-section-gap md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <span className="text-label-sm mb-4 block tracking-[0.3em] text-on-surface-variant/50">
              Recientes
            </span>
            <h2 className="text-headline-lg">Galerías publicadas</h2>
          </div>
          <Link
            href={routes.events}
            className="text-label-sm hidden border-b border-white/20 pb-1 tracking-widest transition-all hover:border-white md:block"
          >
            Ver todo el archivo
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eventsWithCovers.map(({ event, coverPhotoId }) => (
            <Link
              key={event.id}
              href={routes.event(event.slug)}
              className="group relative aspect-[4/3] overflow-hidden"
            >
              {coverPhotoId ? (
                <ProtectedImage
                  src={getSecureMediaUrl(coverPhotoId, "thumbnail")}
                  alt={event.title}
                  fill
                  className="grayscale-filter object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <Image
                  src={HERO_IMAGE}
                  alt=""
                  fill
                  className="object-cover opacity-40 grayscale"
                  sizes="33vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-label-sm mb-1 tracking-widest text-on-surface-variant">
                  {EVENT_CATEGORY_LABELS[event.category]}
                </p>
                <h4 className="text-headline-md line-clamp-1">{event.title}</h4>
                <p className="text-caption mt-1 text-on-surface-variant/70">
                  {formatEventDate(event.eventDate)} · {event.photoCount} fotos
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
    );
  } catch (error) {
    console.error("[RecentEventsSection]", error);
    return null;
  }
}
