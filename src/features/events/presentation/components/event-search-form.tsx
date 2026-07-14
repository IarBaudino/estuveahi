"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { EVENT_CATEGORY_LABELS } from "@/domain/enums/event-category";
import {
  ARGENTINA_PROVINCE_LABELS,
  argentinaProvinceValues,
} from "@/domain/enums/argentina-province";

interface EventSearchFormProps {
  defaultValues: {
    q: string;
    category: string;
    province: string;
    city: string;
  };
}

const selectClassName =
  "flex h-10 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-white/20";

export function EventSearchForm({ defaultValues }: EventSearchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const q = formData.get("q") as string;
    const category = formData.get("category") as string;
    const province = formData.get("province") as string;
    const city = formData.get("city") as string;
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (province) params.set("province", province);
    if (city) params.set("city", city);
    startTransition(() => {
      router.push(`/eventos?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 grid gap-4 rounded-xl border border-white/10 bg-zinc-950/50 p-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <Input
        name="q"
        label="Buscar"
        placeholder="Nombre del evento..."
        defaultValue={defaultValues.q}
      />
      <div className="space-y-1.5">
        <label htmlFor="category" className="block text-sm font-medium text-on-surface">
          Categoría
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaultValues.category}
          className={selectClassName}
        >
          <option value="">Todas</option>
          {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="province" className="block text-sm font-medium text-on-surface">
          Provincia
        </label>
        <select
          id="province"
          name="province"
          defaultValue={defaultValues.province}
          className={selectClassName}
        >
          <option value="">Todo el país</option>
          {argentinaProvinceValues.map((value) => (
            <option key={value} value={value}>
              {ARGENTINA_PROVINCE_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <Input
        name="city"
        label="Ciudad"
        placeholder="Opcional"
        defaultValue={defaultValues.city}
      />
      <div className="flex items-end">
        <Button type="submit" className="w-full" isLoading={isPending}>
          Buscar
        </Button>
      </div>
    </form>
  );
}
