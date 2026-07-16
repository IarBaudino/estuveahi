"use client";

import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/shared/ui/button";
import {
  publishEventAction,
  archiveEventAction,
  deleteEventAction,
} from "@/features/events/presentation/actions/event.actions";
import { businessConfig } from "@/config/business";
import { actionFeedback } from "@/shared/lib/action-feedback";
import { toastMessages } from "@/shared/lib/toast-messages";
import { isEventDateTodayOrYesterday } from "@/shared/lib/event-same-day";

interface EventActionsProps {
  eventId: string;
  status: string;
  photoCount?: number;
  eventDate?: string | Date;
}

export function EventActions({
  eventId,
  status,
  photoCount = 0,
  eventDate,
}: EventActionsProps) {
  const router = useRouter();
  const { execute: publish, isExecuting: publishing } = useAction(
    publishEventAction,
    actionFeedback({
      successMessage: toastMessages.published,
      onSuccess: () => router.refresh(),
    }),
  );
  const { execute: archive, isExecuting: archiving } = useAction(
    archiveEventAction,
    actionFeedback({
      successMessage: "Evento archivado",
      onSuccess: () => router.refresh(),
    }),
  );
  const { execute: remove, isExecuting: deleting } = useAction(
    deleteEventAction,
    actionFeedback({
      successMessage: toastMessages.deleted,
      onSuccess: () => router.push("/fotografo/eventos"),
    }),
  );

  const emptyGalleryNotice =
    photoCount === 0
      ? eventDate && isEventDateTodayOrYesterday(eventDate)
        ? "\n\nSin fotos aún: al publicar, el evento aparece en la home como “Pronto” hasta que subas la primera imagen."
        : "\n\nSin fotos: solo podés anunciar la galería vacía si la fecha del evento es hoy o ayer."
      : "";

  return (
    <div className="flex flex-wrap gap-2">
      {status === "draft" && (
        <Button
          size="sm"
          onClick={() => {
            if (
              confirm(
                `¿Publicar este evento en el catálogo?\n\n${businessConfig.eventListingNotice}${emptyGalleryNotice}`,
              )
            ) {
              publish({ eventId });
            }
          }}
          isLoading={publishing}
        >
          Publicar evento
        </Button>
      )}
      {status === "published" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => archive({ eventId })}
          isLoading={archiving}
        >
          Archivar
        </Button>
      )}
      <Button
        size="sm"
        variant="destructive"
        onClick={() => {
          if (confirm("¿Eliminar este evento y todas sus fotos?")) {
            remove({ eventId });
          }
        }}
        isLoading={deleting}
      >
        Eliminar
      </Button>
    </div>
  );
}
