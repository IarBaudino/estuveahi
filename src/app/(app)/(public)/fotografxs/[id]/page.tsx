import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import {
  getPublicEventsByPhotographer,
  getPublicPhotographerById,
} from "@/features/photographers/infrastructure/photographer.repository";
import { PhotographerPublicProfile } from "@/features/photographers/presentation/components/photographer-public-profile";
import { formatEventDate } from "@/shared/lib/utils";
import { EVENT_CATEGORY_LABELS } from "@/domain/enums/event-category";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const photographer = await getPublicPhotographerById(id);
  if (!photographer) {
    return { title: PHOTOGRAPHER_LABEL.singularCap };
  }
  return {
    title: `${photographer.displayName} · ${PHOTOGRAPHER_LABEL.singularCap}`,
    description: photographer.bio ?? `Galerías de ${photographer.displayName} en EstuveAhí`,
  };
}

export default async function PhotographerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const [photographer, events] = await Promise.all([
    getPublicPhotographerById(id),
    getPublicEventsByPhotographer(id),
  ]);

  if (!photographer) notFound();

  return (
    <div className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
      <Link
        href={routes.photographers}
        className="text-sm text-on-surface-variant underline"
      >
        ← Todxs lxs {PHOTOGRAPHER_LABEL.plural}
      </Link>

      <div className="mt-8 overflow-hidden hairline-border">
        <PhotographerPublicProfile photographer={photographer} showGalleryLink={false} />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Galerías publicadas</h2>
        {events.length > 0 ? (
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={routes.event(event.slug)}
                className="block hairline-border p-5 transition-colors hover:bg-white/5"
              >
                <p className="text-label-sm text-on-surface-variant">
                  {EVENT_CATEGORY_LABELS[event.category]}
                </p>
                <h3 className="text-headline-md mt-1 line-clamp-1">{event.title}</h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {formatEventDate(event.eventDate)} · {event.photoCount} fotos
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-on-surface-variant">
            Este {PHOTOGRAPHER_LABEL.singular} todavía no tiene eventos publicados.
          </p>
        )}
      </div>
    </div>
  );
}
