import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import {
  getPublicEventsByPhotographer,
  getPublicPhotographerById,
} from "@/features/photographers/infrastructure/photographer.repository";
import { formatDate } from "@/shared/lib/utils";
import { EVENT_CATEGORY_LABELS } from "@/domain/enums/event-category";
import { BadgeCheck, ExternalLink } from "lucide-react";

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

      <div className="mt-8 hairline-border p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="text-headline-lg">{photographer.displayName}</h1>
          {photographer.isVerified && (
            <span className="inline-flex items-center gap-1 text-sm text-primary">
              <BadgeCheck className="h-4 w-4" />
              Verificado
            </span>
          )}
        </div>
        {photographer.bio && (
          <p className="mt-4 max-w-2xl text-on-surface-variant">{photographer.bio}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {photographer.instagramHandle && (
            <span className="text-on-surface-variant">{photographer.instagramHandle}</span>
          )}
          {photographer.websiteUrl && (
            <a
              href={photographer.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline"
            >
              Sitio web
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Eventos publicados</h2>
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
                  {formatDate(event.eventDate)} · {event.photoCount} fotos
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
