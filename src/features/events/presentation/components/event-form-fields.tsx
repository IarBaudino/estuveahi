"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { CreateEventInput } from "@/features/events/application/schemas/event.schema";
import { EVENT_CATEGORY_LABELS } from "@/domain/enums/event-category";
import {
  ARGENTINA_PROVINCE_LABELS,
  argentinaProvinceValues,
} from "@/domain/enums/argentina-province";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

interface EventFormFieldsProps {
  register: UseFormRegister<CreateEventInput>;
  errors: FieldErrors<CreateEventInput>;
}

const selectClassName =
  "flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-3 text-sm";

export function EventFormFields({ register, errors }: EventFormFieldsProps) {
  return (
    <>
      <Input label="Título" {...register("title")} error={errors.title?.message} />
      <Textarea label="Descripción" {...register("description")} rows={3} />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium">Categoría</label>
        <select {...register("category")} className={selectClassName}>
          {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Lugar" {...register("venue")} />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">Provincia</label>
          <select {...register("province")} className={selectClassName}>
            {argentinaProvinceValues.map((value) => (
              <option key={value} value={value}>
                {ARGENTINA_PROVINCE_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Input label="Ciudad" {...register("city")} />
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
