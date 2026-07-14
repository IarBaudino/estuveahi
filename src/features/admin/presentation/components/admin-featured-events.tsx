"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import type { PublishedEventPickerItem } from "@/features/events/infrastructure/event.repository";
import { setFeaturedEventIdsAction } from "@/features/admin/presentation/actions/landing.actions";
import { Button } from "@/shared/ui/button";
import { formatDate } from "@/shared/lib/utils";
import { actionFeedback } from "@/shared/lib/action-feedback";

interface AdminFeaturedEventsProps {
  publishedEvents: PublishedEventPickerItem[];
  selectedEventIds: string[];
}

export function AdminFeaturedEvents({
  publishedEvents,
  selectedEventIds: initialSelected,
}: AdminFeaturedEventsProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initialSelected);

  const { execute: save, isExecuting } = useAction(
    setFeaturedEventIdsAction,
    actionFeedback({ onSuccess: () => router.refresh() }),
  );

  function toggleEventId(eventId: string) {
    setSelected((current) => {
      if (current.includes(eventId)) {
        return current.filter((id) => id !== eventId);
      }
      if (current.length >= 6) return current;
      return [...current, eventId];
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-on-surface-variant">
        Elegí qué eventos publicados aparecen destacados en la home (máximo 6).
      </p>

      {publishedEvents.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          No hay eventos publicados todavía. Publicá eventos desde el panel fotografx o admin.
        </p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto hairline-border p-3">
          {publishedEvents.map((event) => {
            const checked = selected.includes(event.id);
            return (
              <li key={event.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-sm p-2 hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleEventId(event.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">{event.title}</span>
                    <span className="mt-0.5 block text-xs text-on-surface-variant">
                      {formatDate(event.eventDate)} · {event.photoCount} fotos
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="sm"
          isLoading={isExecuting}
          onClick={() => save({ eventIds: selected })}
        >
          Guardar eventos destacados
        </Button>
        <span className="text-xs text-on-surface-variant">
          {selected.length} seleccionado{selected.length === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
