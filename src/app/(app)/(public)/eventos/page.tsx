import { Suspense } from "react";
import { searchPublicEvents } from "@/features/events/infrastructure/event.repository";
import { EventCard } from "@/features/events/presentation/components/event-card";
import { EventSearchForm } from "@/features/events/presentation/components/event-search-form";
import { EVENT_CATEGORY_LABELS, EventCategory } from "@/domain/enums/event-category";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explorar eventos",
  description: "Encuentra fotografías de recitales, festivales, deportes y más.",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    city?: string;
    page?: string;
  }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { events, total } = await searchPublicEvents({
    q: params.q,
    category: params.category as EventCategory | undefined,
    city: params.city,
    page,
    limit: 20,
  });

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
      <div className="mb-12">
        <span className="text-label-sm mb-4 block tracking-[0.3em] text-on-surface-variant/50">
          Catálogo
        </span>
        <h1 className="text-headline-lg">Explorar eventos</h1>
        <p className="mt-2 text-on-surface-variant">
          Encuentra fotografías de los eventos a los que asististe
        </p>
      </div>

      <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-zinc-100" />}>
        <EventSearchForm
          defaultValues={{
            q: params.q ?? "",
            category: params.category ?? "",
            city: params.city ?? "",
          }}
        />
      </Suspense>

      {events.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-on-surface-variant">{total} eventos encontrados</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...params, page: String(p) } as Record<string, string>)}`}
                  className={`px-3 py-1 text-sm ${
                    p === page
                      ? "bg-primary text-background"
                      : "text-on-surface-variant hover:bg-white/5"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mt-12 text-center">
          <p className="mt-12 text-center text-on-surface-variant">
            No se encontraron eventos con esos filtros.
          </p>
        </div>
      )}
    </div>
  );
}
