"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { EVENT_CATEGORY_LABELS, EventCategory } from "@/domain/enums/event-category";

interface EventSearchFormProps {
  defaultValues: {
    q: string;
    category: string;
    city: string;
  };
}

export function EventSearchForm({ defaultValues }: EventSearchFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const q = formData.get("q") as string;
    const category = formData.get("category") as string;
    const city = formData.get("city") as string;
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    startTransition(() => {
      router.push(`/eventos?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 grid gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:grid-cols-4"
    >
      <Input
        name="q"
        label="Buscar"
        placeholder="Nombre del evento..."
        defaultValue={defaultValues.q}
      />
      <div className="space-y-1.5">
        <label htmlFor="category" className="block text-sm font-medium">
          Categoría
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaultValues.category}
          className="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">Todas</option>
          {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <Input
        name="city"
        label="Ciudad"
        placeholder="Buenos Aires"
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
