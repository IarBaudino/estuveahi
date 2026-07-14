"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { formatDate } from "@/shared/lib/utils";
import { formatListingExpiryDate } from "@/shared/lib/event-listing";
import { routes } from "@/config/routes";
import {
  adminArchiveEventAction,
  adminDeleteEventAction,
} from "@/features/admin/presentation/actions/admin.actions";
import { adminActionFeedback } from "@/shared/lib/admin-action-feedback";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";

export interface AdminEventRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  photoCount: number;
  eventDate: Date;
  photographerId: string;
  photographerName: string;
  publishedAt: Date | null;
  listingExpiresAt: Date | null;
}

export function AdminEventsTable({ events }: { events: AdminEventRow[] }) {
  const router = useRouter();
  const actionOptions = adminActionFeedback({ onSuccess: () => router.refresh() });

  const { execute: archive, isExecuting: archiving } = useAction(
    adminArchiveEventAction,
    actionOptions,
  );
  const { execute: remove, isExecuting: removing } = useAction(
    adminDeleteEventAction,
    actionOptions,
  );

  if (events.length === 0) {
    return <p className="text-on-surface-variant">No hay eventos registrados.</p>;
  }

  return (
    <div className="overflow-x-auto hairline-border">
      <table className="w-full text-sm">
        <thead className="border-b border-white/10 bg-surface-container">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Título</th>
            <th className="px-4 py-3 text-left font-medium">{PHOTOGRAPHER_LABEL.singularCap}</th>
            <th className="px-4 py-3 text-left font-medium">Fecha</th>
            <th className="px-4 py-3 text-left font-medium">Estado</th>
            <th className="px-4 py-3 text-left font-medium">Cartelera</th>
            <th className="px-4 py-3 text-left font-medium">Fotos</th>
            <th className="px-4 py-3 text-left font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {events.map((event) => (
            <tr key={event.id}>
              <td className="px-4 py-3 font-medium">{event.title}</td>
              <td className="px-4 py-3">{event.photographerName}</td>
              <td className="px-4 py-3">{formatDate(event.eventDate)}</td>
              <td className="px-4 py-3">
                <Badge>{event.status}</Badge>
              </td>
              <td className="px-4 py-3 text-xs text-on-surface-variant">
                {event.status === "published" && event.listingExpiresAt ? (
                  event.listingExpiresAt.getTime() <= Date.now() ? (
                    <span className="text-red-400">
                      Venció {formatListingExpiryDate(event.listingExpiresAt)}
                    </span>
                  ) : (
                    <span>Hasta {formatListingExpiryDate(event.listingExpiresAt)}</span>
                  )
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">{event.photoCount}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link href={routes.admin.event(event.id)}>
                    <Button size="sm" variant="secondary">
                      Gestionar
                    </Button>
                  </Link>
                  {event.status === "published" && event.slug && (
                    <Link href={routes.event(event.slug)} target="_blank">
                      <Button size="sm" variant="outline">
                        Ver galería
                      </Button>
                    </Link>
                  )}
                  {event.status !== "archived" && (
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={archiving}
                      onClick={() => {
                        if (confirm(`¿Archivar "${event.title}"?`)) {
                          archive({ eventId: event.id });
                        }
                      }}
                    >
                      Archivar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    isLoading={removing}
                    onClick={() => {
                      if (
                        confirm(
                          `¿Eliminar "${event.title}"? Esta acción no se puede deshacer.`,
                        )
                      ) {
                        remove({ eventId: event.id });
                      }
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
