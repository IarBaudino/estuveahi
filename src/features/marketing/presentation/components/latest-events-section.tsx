import Link from "next/link";
import { searchPublicEvents } from "@/features/events/infrastructure/event.repository";
import { formatEventDate } from "@/shared/lib/utils";
import { routes } from "@/config/routes";

export async function LatestEventsSection() {
  try {
    const { events } = await searchPublicEvents({ page: 1, limit: 3 });
    if (events.length === 0) return null;

    return (
      <section className="bg-surface-container-lowest px-margin-mobile py-section-compact md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <div className="mb-8 flex items-end justify-between md:mb-10">
            <div>
              <span className="text-label-sm mb-3 block tracking-[0.3em] text-on-surface-variant/50">
                Recientes
              </span>
              <h2 className="text-headline-lg">Últimos eventos</h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Las galerías publicadas más recientes
              </p>
            </div>
            <Link
              href={routes.events}
              className="text-label-sm hidden border-b border-white/20 pb-1 tracking-widest transition-all hover:border-white md:block"
            >
              Ver todos
            </Link>
          </div>

          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {events.map((event) => {
              const place = [event.venue, event.city].filter(Boolean).join(" · ");

              return (
                <li key={event.id}>
                  <Link
                    href={routes.event(event.slug)}
                    className="group flex h-full flex-col justify-between border border-white/10 bg-surface-container px-5 py-6 transition-colors hover:border-white/25 hover:bg-white/[0.03]"
                  >
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-on-surface-variant/45">
                        {formatEventDate(event.eventDate)}
                      </p>
                      <h3 className="text-headline-md mt-3 line-clamp-2 transition-colors group-hover:text-primary">
                        {event.title}
                      </h3>
                    </div>
                    {place ? (
                      <p className="mt-6 text-sm text-on-surface-variant">{place}</p>
                    ) : (
                      <p className="mt-6 text-sm text-on-surface-variant/50">Sin lugar</p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 text-center md:hidden">
            <Link
              href={routes.events}
              className="text-label-sm border-b border-white/20 pb-1 tracking-widest"
            >
              Ver todos
            </Link>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error("[LatestEventsSection]", error);
    return null;
  }
}
