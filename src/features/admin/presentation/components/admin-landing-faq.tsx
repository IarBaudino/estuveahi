"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import type { LandingFaqItem } from "@/config/landing.defaults";
import {
  deleteLandingFaqItemAction,
  restoreDefaultLandingFaqAction,
  saveLandingFaqItemAction,
} from "@/features/admin/presentation/actions/landing.actions";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { emitToastSuccess } from "@/shared/lib/toast-bus";
import { toastMessages } from "@/shared/lib/toast-messages";

interface AdminLandingFaqProps {
  items: LandingFaqItem[];
}

const emptyForm = {
  question: "",
  answer: "",
  sortOrder: 0,
};

export function AdminLandingFaq({ items: initialItems }: AdminLandingFaqProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const refresh = () => router.refresh();

  const { execute: saveItem, isExecuting: saving } = useAction(saveLandingFaqItemAction, {
    onSuccess: ({ data }) => {
      if (data?.item) {
        setItems((current) => {
          const next = [...current.filter((i) => i.id !== data.item.id), data.item];
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

  const { execute: removeItem, isExecuting: removing } = useAction(deleteLandingFaqItemAction, {
    onSuccess: ({ data }) => {
      if (data?.faq) setItems(data.faq);
      setEditingId(null);
      setShowForm(false);
      emitToastSuccess(toastMessages.deleted);
      refresh();
    },
  });

  const { execute: restoreDefaults, isExecuting: restoring } = useAction(
    restoreDefaultLandingFaqAction,
    {
      onSuccess: ({ data }) => {
        if (data?.faq) setItems(data.faq);
        emitToastSuccess("FAQ restaurado");
        refresh();
      },
    },
  );

  function startEdit(item: LandingFaqItem) {
    setEditingId(item.id);
    setShowForm(true);
    setForm({
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
    });
  }

  function startCreate() {
    setEditingId(null);
    setShowForm(true);
    setForm({ ...emptyForm, sortOrder: items.length });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveItem({
      id: editingId ?? undefined,
      question: form.question,
      answer: form.answer,
      sortOrder: form.sortOrder,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={startCreate}>
          Agregar pregunta
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
          <Input
            label="Pregunta"
            value={form.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            required
          />
          <Textarea
            label="Respuesta"
            value={form.answer}
            onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
            rows={4}
            required
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
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 rounded-lg border border-white/10 p-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium">{item.question}</p>
              <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">{item.answer}</p>
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
        {items.length === 0 && (
          <p className="text-sm text-on-surface-variant">No hay preguntas configuradas.</p>
        )}
      </ul>
    </div>
  );
}
