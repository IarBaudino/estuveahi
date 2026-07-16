import Link from "next/link";
import { getComingSoonPublicEvents } from "@/features/events/infrastructure/event.repository";
import { routes } from "@/config/routes";

export async function ComingSoonEventsSection() {
  const events = await getComingSoonPublicEvents(8);

  if (events.length === 0) return null;

  return (
    <section className="border-b border-white/10 bg-surface-container-lowest px-margin-mobile py-10 md:px-margin-desktop md:py-12">
      <div className="mx-auto max-w-container-max">
        <span className="text-label-sm mb-3 block tracking-[0.3em] text-on-surface-variant/50">
          Pronto
        </span>
        <h2 className="text-headline-md md:text-headline-lg">Galerías en camino</h2>
        <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
          Las fotos van a estar disponibles en cualquier momento.
        </p>

        <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-2 text-base md:text-lg">
          {events.map((event, index) => (
            <li key={event.id} className="inline-flex items-baseline gap-3">
              {index > 0 && (
                <span className="text-on-surface-variant/40" aria-hidden>
                  ·
                </span>
              )}
              <Link
                href={routes.event(event.slug)}
                className="font-medium tracking-wide transition-colors hover:text-primary"
              >
                {event.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
