import Link from "next/link";
import { getComingSoonPublicEvents } from "@/features/events/infrastructure/event.repository";
import { routes } from "@/config/routes";
import { formatEventDate } from "@/shared/lib/utils";
import { MaterialIcon } from "@/shared/components/icon";

export async function ComingSoonEventsSection() {
  const events = await getComingSoonPublicEvents(6);

  if (events.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06),_transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span
                className="coming-soon-pulse inline-block h-2 w-2 bg-primary"
                aria-hidden
              />
              <span className="text-label-sm tracking-[0.35em] text-on-surface-variant/60">
                En carga
              </span>
            </div>
            <h2 className="text-headline-lg">Próximo evento a publicar</h2>
            <p className="mt-2 max-w-lg text-sm text-on-surface-variant md:text-base">
              Las fotos de este evento estarán disponibles pronto! Estate atentx a EA! para encontrar tus recuerdos!
            </p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-on-surface-variant/40">
            {events.length === 1 ? "1 evento" : `${events.length} eventos`}
          </p>
        </div>

        <ul className="divide-y divide-white/10 border-y border-white/10">
          {events.map((event) => {
            const place = [event.venue, event.city].filter(Boolean).join(" · ");

            return (
              <li key={event.id}>
                <Link
                  href={routes.event(event.slug)}
                  className="group relative flex items-center justify-between gap-6 py-6 transition-colors md:py-7"
                >
                  <div className="coming-soon-track pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <span className="coming-soon-shimmer absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-on-surface-variant/45 md:text-[11px]">
                      Pronto
                      {event.eventDate ? ` · ${formatEventDate(event.eventDate)}` : ""}
                    </p>
                    <h3 className="text-display-xl mt-2 max-w-4xl text-[clamp(1.75rem,4.5vw,3.25rem)] leading-[1.05] transition-transform duration-500 group-hover:translate-x-1">
                      {event.title}
                    </h3>
                    <p className="mt-3 truncate text-sm text-on-surface-variant">
                      por {event.photographer.displayName}
                      {event.photographer.isVerified ? " ✓" : ""}
                      {place ? ` · ${place}` : ""}
                    </p>
                  </div>

                  <span className="hidden shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant/50 transition-colors group-hover:text-primary sm:inline-flex">
                    Ver
                    <MaterialIcon
                      name="arrow_forward"
                      className="text-base transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
