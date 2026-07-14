"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createHireRequestSchema,
  type CreateHireRequestInput,
} from "@/features/hire-requests/application/schemas/hire-request.schema";
import { createHireRequestAction } from "@/features/hire-requests/presentation/actions/hire-request.actions";
import {
  ARGENTINA_PROVINCE_LABELS,
  argentinaProvinceValues,
  ArgentinaProvince,
} from "@/domain/enums/argentina-province";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import Link from "next/link";
import { routes } from "@/config/routes";

export function HirePhotographerForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateHireRequestInput>({
    resolver: zodResolver(createHireRequestSchema),
    defaultValues: {
      province: ArgentinaProvince.CABA,
    },
  });

  const { execute, isExecuting, result } = useAction(createHireRequestAction, {
    onSuccess: () => {
      setSubmitted(true);
      reset({ province: ArgentinaProvince.CABA });
    },
  });

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recibimos tu mensaje</CardTitle>
          <CardDescription>
            Te vamos a contactar a la brevedad para conectarte con{" "}
            {PHOTOGRAPHER_LABEL.plural} de la plataforma.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={() => setSubmitted(false)} className="flex-1">
            Enviar otra consulta
          </Button>
          <Link
            href={routes.photographers}
            className="text-label-sm inline-flex h-10 flex-1 items-center justify-center border border-white/20 px-4 tracking-widest text-primary uppercase transition-all hover:bg-white/5"
          >
            Ver {PHOTOGRAPHER_LABEL.plural}
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiero contratar {PHOTOGRAPHER_LABEL.singular}</CardTitle>
        <CardDescription>
          Contanos tu evento y te conectamos con {PHOTOGRAPHER_LABEL.plural} de
          EstuveAhí.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit((data) => execute(data))} className="space-y-4">
        <Input
          label="Nombre"
          {...register("name")}
          error={errors.name?.message}
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
          autoComplete="email"
        />
        <Input
          label="WhatsApp / teléfono"
          {...register("phone")}
          error={errors.phone?.message}
          placeholder="+54 11 ..."
          autoComplete="tel"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="province" className="block text-sm font-medium text-on-surface">
              Provincia
            </label>
            <select
              id="province"
              {...register("province")}
              className="flex h-10 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {argentinaProvinceValues.map((value) => (
                <option key={value} value={value}>
                  {ARGENTINA_PROVINCE_LABELS[value]}
                </option>
              ))}
            </select>
            {errors.province?.message && (
              <p className="text-xs text-red-400">{errors.province.message}</p>
            )}
          </div>
          <Input label="Ciudad" {...register("city")} error={errors.city?.message} />
        </div>
        <Input
          label="Tipo de evento"
          {...register("eventType")}
          error={errors.eventType?.message}
          placeholder="Recital, casamiento, corporativo…"
        />
        <Input
          label="Fecha aproximada"
          type="date"
          {...register("eventDate")}
          error={errors.eventDate?.message}
        />
        <Textarea
          label="Contanos un poco más"
          {...register("message")}
          error={errors.message?.message}
          rows={4}
          placeholder="Lugar, duración, estilo que buscás, presupuesto orientativo…"
        />
        {result.serverError && (
          <p className="text-sm text-red-500">{result.serverError}</p>
        )}
        <Button type="submit" className="w-full" isLoading={isExecuting}>
          Enviar consulta
        </Button>
      </form>
    </Card>
  );
}
