"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEventSchema,
  type CreateEventInput,
} from "@/features/events/application/schemas/event.schema";
import { createEventAction } from "@/features/events/presentation/actions/event.actions";
import { EVENT_CATEGORY_LABELS } from "@/domain/enums/event-category";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/shared/ui/card";
import { routes } from "@/config/routes";

export default function NewEventPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: { category: "other", country: "AR", isPublic: true },
  });

  const { execute, isExecuting, result } = useAction(createEventAction, {
    onSuccess: ({ data }) => {
      if (data?.event) router.push(routes.photographer.event(data.event.id));
    },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Nuevo evento</h1>
      <p className="mt-1 text-zinc-500">Crea un evento para subir tus fotografías</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Información del evento</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit((data) => execute(data))} className="space-y-4">
          <Input label="Título" {...register("title")} error={errors.title?.message} />
          <Textarea label="Descripción" {...register("description")} rows={4} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Categoría</label>
            <select
              {...register("category")}
              className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
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
            <p className="text-sm text-red-500">{result.serverError}</p>
          )}
          <Button type="submit" isLoading={isExecuting}>Crear evento</Button>
        </form>
      </Card>
    </div>
  );
}
