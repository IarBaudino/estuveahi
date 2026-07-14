"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import type { LandingTestimonial } from "@/config/landing.defaults";
import {
  deleteLandingTestimonialAction,
  restoreDefaultLandingTestimonialsAction,
  saveLandingTestimonialAction,
} from "@/features/admin/presentation/actions/landing.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { emitToastSuccess } from "@/shared/lib/toast-bus";
import { toastMessages } from "@/shared/lib/toast-messages";

interface AdminLandingTestimonialsProps {
  testimonials: LandingTestimonial[];
}

const emptyForm = {
  quote: "",
  name: "",
  role: "",
  avatarUrl: "",
  sortOrder: 0,
};

export function AdminLandingTestimonials({
  testimonials: initialTestimonials,
}: AdminLandingTestimonialsProps) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const refresh = () => router.refresh();

  const { execute: saveItem, isExecuting: saving } = useAction(saveLandingTestimonialAction, {
    onSuccess: ({ data }) => {
      if (data?.testimonial) {
        setTestimonials((current) => {
          const next = [...current.filter((t) => t.id !== data.testimonial.id), data.testimonial];
          return next.sort((a, b) => a.sortOrder - b.sortOrder);
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      emitToastSuccess(toastMessages.saved);
      refresh();
    },
  });

  const { execute: removeItem, isExecuting: removing } = useAction(
    deleteLandingTestimonialAction,
    {
      onSuccess: ({ data }) => {
        if (data?.testimonials) setTestimonials(data.testimonials);
        setEditingId(null);
        setShowForm(false);
        emitToastSuccess(toastMessages.deleted);
        refresh();
      },
    },
  );

  const { execute: restoreDefaults, isExecuting: restoring } = useAction(
    restoreDefaultLandingTestimonialsAction,
    {
      onSuccess: ({ data }) => {
        if (data?.testimonials) setTestimonials(data.testimonials);
        emitToastSuccess("Testimonios restaurados");
        refresh();
      },
    },
  );

  function startEdit(item: LandingTestimonial) {
    setEditingId(item.id);
    setShowForm(true);
    setForm({
      quote: item.quote,
      name: item.name,
      role: item.role,
      avatarUrl: item.avatarUrl ?? "",
      sortOrder: item.sortOrder,
    });
  }

  function startCreate() {
    setEditingId(null);
    setShowForm(true);
    setForm({ ...emptyForm, sortOrder: testimonials.length });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveItem({
      id: editingId ?? undefined,
      quote: form.quote,
      name: form.name,
      role: form.role,
      avatarUrl: form.avatarUrl.trim() ? form.avatarUrl.trim() : null,
      sortOrder: form.sortOrder,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={startCreate}>
          Agregar opinión
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => restoreDefaults()}
          isLoading={restoring}
        >
          Restaurar defaults
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-white/10 p-4">
          <Textarea
            label="Cita"
            value={form.quote}
            onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
            rows={4}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Input
              label="Rol / descripción"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              required
            />
          </div>
          <Input
            label="URL de avatar (opcional)"
            value={form.avatarUrl}
            onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
            placeholder="https://"
          />
          <Input
            label="Orden"
            type="number"
            min={0}
            max={99}
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
          />
          <div className="flex gap-2">
            <Button type="submit" isLoading={saving}>
              {editingId ? "Guardar" : "Crear"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <ul className="space-y-3">
        {testimonials.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 rounded-lg border border-white/10 p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="flex min-w-0 gap-3">
              {item.avatarUrl ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={item.avatarUrl}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-full bg-surface-container-high" />
              )}
              <div className="min-w-0">
                <p className="font-medium">
                  {item.name} · {item.role}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{item.quote}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => startEdit(item)}>
                Editar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeItem({ id: item.id })}
                isLoading={removing}
              >
                Eliminar
              </Button>
            </div>
          </li>
        ))}
        {testimonials.length === 0 && (
          <p className="text-sm text-on-surface-variant">No hay opiniones configuradas.</p>
        )}
      </ul>
    </div>
  );
}
