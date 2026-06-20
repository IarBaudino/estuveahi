"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEventSchema,
  adminCreateEventSchema,
  type CreateEventInput,
  type AdminCreateEventInput,
} from "@/features/events/application/schemas/event.schema";
import { createEventAction } from "@/features/events/presentation/actions/event.actions";
import { adminCreateEventAction } from "@/features/admin/presentation/actions/admin.actions";
import { EVENT_CATEGORY_LABELS } from "@/domain/enums/event-category";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/shared/ui/card";
import { routes } from "@/config/routes";

interface PhotographerOption {
  id: string;
  label: string;
  email: string;
}

const defaultValues = {
  category: "other" as const,
  country: "AR",
  isPublic: true,
};

function EventFields({
  register,
  errors,
}: {
  register: UseFormRegister<CreateEventInput>;
  errors: FieldErrors<CreateEventInput>;
}) {
  return (
    <>
      <Input label="Título" {...register("title")} error={errors.title?.message} />
      <Textarea label="Descripción" {...register("description")} rows={4} />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">Categoría</label>
        <select
          {...register("category")}
          className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
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
    </>
  );
}

function PhotographerEventCreateForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues,
  });

  const { execute, isExecuting, result } = useAction(createEventAction, {
    onSuccess: ({ data }) => {
      if (data?.event) router.push(routes.photographer.event(data.event.id));
    },
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Información del evento</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit((data) => execute(data))} className="space-y-4">
        <EventFields register={register} errors={errors} />
        {result.serverError && (
          <p className="text-sm text-red-500">{result.serverError}</p>
        )}
        <Button type="submit" isLoading={isExecuting}>
          Crear evento
        </Button>
      </form>
    </Card>
  );
}

function AdminEventCreateForm({ photographers }: { photographers: PhotographerOption[] }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminCreateEventInput>({
    resolver: zodResolver(adminCreateEventSchema),
    defaultValues: {
      ...defaultValues,
      photographerId: photographers[0]?.id ?? "",
    },
  });

  const { execute, isExecuting, result } = useAction(adminCreateEventAction, {
    onSuccess: ({ data }) => {
      if (data?.event) router.push(routes.admin.event(data.event.id));
    },
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Información del evento</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit((data) => execute(data))} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">Fotógrafo</label>
          <select
            {...register("photographerId")}
            className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {photographers.length === 0 ? (
              <option value="">No hay fotógrafos registrados</option>
            ) : (
              photographers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.email})
                </option>
              ))
            )}
          </select>
          {errors.photographerId && (
            <p className="text-sm text-red-500">{errors.photographerId.message}</p>
          )}
        </div>
        <EventFields
          register={register as unknown as UseFormRegister<CreateEventInput>}
          errors={errors}
        />
        {result.serverError && (
          <p className="text-sm text-red-500">{result.serverError}</p>
        )}
        <Button type="submit" isLoading={isExecuting} disabled={photographers.length === 0}>
          Crear evento
        </Button>
      </form>
    </Card>
  );
}

interface EventCreateFormProps {
  mode: "photographer" | "admin";
  photographers?: PhotographerOption[];
}

export function EventCreateForm({ mode, photographers = [] }: EventCreateFormProps) {
  if (mode === "admin") {
    return <AdminEventCreateForm photographers={photographers} />;
  }
  return <PhotographerEventCreateForm />;
}
