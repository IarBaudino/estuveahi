import type { Metadata } from "next";
import { EventSearchForm } from "@/features/events/presentation/components/event-search-form";
import { searchPublicEvents } from "@/features/events/infrastructure/event.repository";
import { EventCategory } from "@/domain/enums/event-category";
import type { ArgentinaProvince } from "@/domain/enums/argentina-province";
import { ARGENTINA_PROVINCE_LABELS } from "@/domain/enums/argentina-province";
import Link from "next/link";
import { routes } from "@/config/routes";
import { formatDate } from "@/shared/lib/utils";
import { EVENT_CATEGORY_LABELS } from "@/domain/enums/event-category";
import { EVENT_LISTING_NOTICE } from "@/shared/lib/event-listing";

export const metadata: Metadata = {
  title: "Explorar eventos",
  description: "Encuentra fotografías de recitales, festivales, deportes y más.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    province?: string;
    city?: string;
    page?: string;
  }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  let events: Awaited<ReturnType<typeof searchPublicEvents>>["events"] = [];
  let total = 0;

  try {
    const result = await searchPublicEvents({
      q: params.q,
      category: params.category as EventCategory | undefined,
      province: params.province as ArgentinaProvince | undefined,
      city: params.city,
      page,
      limit: 20,
    });
    events = result.events;
    total = result.total;
  } catch (error) {
    console.error("[EventsPage]", error);
  }

  const totalPages = Math.ceil(total / 20);
  const hasFilters = Boolean(params.q || params.category || params.province || params.city);

  return (
    <div className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
      <div className="mb-12">
        <span className="text-label-sm mb-4 block tracking-[0.3em] text-on-surface-variant/50">
          Catálogo
        </span>
        <h1 className="text-headline-lg">Explorar eventos</h1>
        <p className="mt-2 text-on-surface-variant">
          Encontrá fotografías de los eventos a los que asististe en todo el país
        </p>
        <p className="mt-3 text-sm text-on-surface-variant/80">{EVENT_LISTING_NOTICE}</p>
      </div>

      <EventSearchForm
        defaultValues={{
          q: params.q ?? "",
          category: params.category ?? "",
          province: params.province ?? "",
          city: params.city ?? "",
        }}
      />

      {events.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-on-surface-variant">{total} eventos encontrados</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const locationParts = [
                event.city,
                event.province ? ARGENTINA_PROVINCE_LABELS[event.province] : null,
              ].filter(Boolean);

              return (
                <Link
                  key={event.id}
                  href={routes.event(event.slug)}
                  className="block overflow-hidden hairline-border p-5 transition-colors hover:bg-white/5"
                >
                  <p className="text-label-sm text-on-surface-variant">
                    {EVENT_CATEGORY_LABELS[event.category]}
                  </p>
                  <h3 className="text-headline-md mt-1 line-clamp-1">{event.title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {formatDate(event.eventDate)} ·{" "}
                    {event.photoCount === 0
                      ? "Galería en camino"
                      : `${event.photoCount} fotos`}
                    {locationParts.length > 0 ? ` · ${locationParts.join(", ")}` : ""}
                  </p>
                </Link>
              );
            })}
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
          <p className="text-on-surface-variant">
            {hasFilters
              ? "No se encontraron eventos con esos filtros."
              : "Todavía no hay eventos publicados en el catálogo."}
          </p>
          {!hasFilters && (
            <p className="mt-3 text-sm text-on-surface-variant/80">
              Los eventos aparecen acá cuando un fotografx los publica desde su panel
              (botón &quot;Publicar evento&quot;).
            </p>
          )}
          <Link href={routes.photographers} className="mt-4 inline-block text-sm underline">
            Ver fotografxs
          </Link>
        </div>
      )}
    </div>
  );
}
