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

interface EventActionsProps {
  eventId: string;
  status: string;
}

export function EventActions({ eventId, status }: EventActionsProps) {
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

  return (
    <div className="flex flex-wrap gap-2">
      {status === "draft" && (
        <Button
          size="sm"
          onClick={() => {
            if (
              confirm(
                `¿Publicar este evento en el catálogo?\n\n${businessConfig.eventListingNotice}`,
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
