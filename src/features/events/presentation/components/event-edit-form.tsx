"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Event } from "@/domain/entities/event";
import { ArgentinaProvince } from "@/domain/enums/argentina-province";
import {
  createEventSchema,
  type CreateEventInput,
} from "@/features/events/application/schemas/event.schema";
import { updateEventAction } from "@/features/events/presentation/actions/event.actions";
import { EventFormFields } from "@/features/events/presentation/components/event-form-fields";
import { Button } from "@/shared/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { actionFeedback } from "@/shared/lib/action-feedback";

interface EventEditFormProps {
  event: Event;
}

/** @deprecated Usar EventManageClient con guardado unificado. */
export function EventEditForm({ event }: EventEditFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const eventDate =
    event.eventDate instanceof Date
      ? event.eventDate.toISOString().slice(0, 10)
      : new Date(event.eventDate).toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: event.title,
      description: event.description ?? "",
      category: event.category,
      venue: event.venue ?? "",
      city: event.city ?? "",
      province: event.province ?? ArgentinaProvince.CABA,
      country: event.country,
      eventDate,
      isPublic: event.isPublic,
    },
  });

  const { execute, isExecuting, result } = useAction(
    updateEventAction,
    actionFeedback({ onSuccess: () => router.refresh() }),
  );

  return (
    <div className="hairline-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-medium"
      >
        Editar información del evento
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit((data) => execute({ id: event.id, ...data }))}
          className="space-y-4 border-t border-white/10 p-4"
        >
          <EventFormFields register={register} errors={errors} />
          {result.serverError && (
            <p className="text-sm text-error">{result.serverError}</p>
          )}
          <Button type="submit" isLoading={isExecuting}>
            Guardar cambios
          </Button>
        </form>
      )}
    </div>
  );
}
