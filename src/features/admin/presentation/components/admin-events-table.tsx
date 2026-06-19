"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { formatDate } from "@/shared/lib/utils";
import { routes } from "@/config/routes";
import {
  adminArchiveEventAction,
  adminDeleteEventAction,
} from "@/features/admin/presentation/actions/admin.actions";

export interface AdminEventRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  photoCount: number;
  eventDate: Date;
  photographerId: string;
  photographerName: string;
}

export function AdminEventsTable({ events }: { events: AdminEventRow[] }) {
  const router = useRouter();
  const { execute: archive, isExecuting: archiving } = useAction(
    adminArchiveEventAction,
    { onSuccess: () => router.refresh() },
  );
  const { execute: remove, isExecuting: removing } = useAction(
    adminDeleteEventAction,
    { onSuccess: () => router.refresh() },
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
            <th className="px-4 py-3 text-left font-medium">Fotógrafo</th>
            <th className="px-4 py-3 text-left font-medium">Fecha</th>
            <th className="px-4 py-3 text-left font-medium">Estado</th>
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
              <td className="px-4 py-3">{event.photoCount}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
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
