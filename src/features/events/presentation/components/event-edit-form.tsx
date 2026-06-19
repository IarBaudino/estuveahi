"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Event } from "@/domain/entities/event";
import {
  createEventSchema,
  type CreateEventInput,
} from "@/features/events/application/schemas/event.schema";
import { updateEventAction } from "@/features/events/presentation/actions/event.actions";
import { EVENT_CATEGORY_LABELS } from "@/domain/enums/event-category";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { ChevronDown, ChevronUp } from "lucide-react";

interface EventEditFormProps {
  event: Event;
}

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
      country: event.country,
      eventDate,
      isPublic: event.isPublic,
    },
  });

  const { execute, isExecuting, result } = useAction(updateEventAction, {
    onSuccess: () => router.refresh(),
  });

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
          <Input label="Título" {...register("title")} error={errors.title?.message} />
          <Textarea label="Descripción" {...register("description")} rows={3} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Categoría</label>
            <select
              {...register("category")}
              className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-3 text-sm"
            >
              {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Lugar" {...register("venue")} />
            <Input label="Ciudad" {...register("city")} />
          </div>
          <Input
            label="Fecha del evento"
            type="date"
            {...register("eventDate")}
            error={errors.eventDate?.message}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isPublic")} className="rounded" />
            Evento público (visible en búsqueda)
          </label>
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
