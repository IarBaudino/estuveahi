import Link from "next/link";
import { getFeaturedEventsByIds } from "@/features/events/infrastructure/event.repository";
import { EventCard } from "@/features/events/presentation/components/event-card";
import { routes } from "@/config/routes";

interface FeaturedEventsSectionProps {
  eventIds: string[];
}

export async function FeaturedEventsSection({ eventIds }: FeaturedEventsSectionProps) {
  const events = await getFeaturedEventsByIds(eventIds);
  if (events.length === 0) return null;

  return (
    <section className="bg-surface-container-lowest px-margin-mobile py-section-compact md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <div className="mb-8 flex items-end justify-between md:mb-10">
          <div>
            <span className="text-label-sm mb-4 block tracking-[0.3em] text-on-surface-variant/50">
              Destacados
            </span>
            <h2 className="text-headline-lg">Galerías destacadas</h2>
          </div>
          <Link
            href={routes.events}
            className="text-label-sm hidden border-b border-white/20 pb-1 tracking-widest transition-all hover:border-white md:block"
          >
            Ver todo el archivo
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} colorCover />
          ))}
        </div>
      </div>
    </section>
  );
}
