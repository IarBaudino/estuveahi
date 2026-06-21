"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import type { LandingCategoryLayout, LandingFeaturedCategory } from "@/config/landing.defaults";
import { LANDING_IMAGE_LABELS } from "@/config/landing.defaults";
import { EVENT_CATEGORY_LABELS, EventCategory } from "@/domain/enums/event-category";
import {
  deleteFeaturedCategoryAction,
  saveFeaturedCategoryAction,
  uploadFeaturedCategoryImageAction,
} from "@/features/admin/presentation/actions/landing.actions";
import {
  categoryLayoutClasses,
  resolveFeaturedCategoryImage,
} from "@/shared/lib/landing-category";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import type { LandingImages } from "@/config/landing.defaults";

interface AdminFeaturedCategoriesProps {
  categories: LandingFeaturedCategory[];
  images: LandingImages;
}

const emptyForm: {
  title: string;
  subtitle: string;
  eventCategory: string;
  href: string;
  layout: LandingCategoryLayout;
  grayscale: boolean;
  sortOrder: number;
} = {
  title: "",
  subtitle: "",
  eventCategory: "",
  href: "",
  layout: "narrow",
  grayscale: true,
  sortOrder: 0,
};

export function AdminFeaturedCategories({
  categories: initialCategories,
  images,
}: AdminFeaturedCategoriesProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const refresh = () => router.refresh();

  const { execute: saveCategory, isExecuting: saving } = useAction(saveFeaturedCategoryAction, {
    onSuccess: ({ data }) => {
      if (data?.category) {
        setCategories((current) => {
          const next = [...current.filter((c) => c.id !== data.category.id), data.category];
          return next.sort((a, b) => a.sortOrder - b.sortOrder);
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      refresh();
    },
  });

  const { execute: removeCategory, isExecuting: removing } = useAction(
    deleteFeaturedCategoryAction,
    {
      onSuccess: ({ data }) => {
        if (data?.categories) setCategories(data.categories);
        refresh();
      },
    },
  );

  const { execute: uploadImage, isExecuting: uploading } = useAction(
    uploadFeaturedCategoryImageAction,
    { onSuccess: () => refresh() },
  );

  function startEdit(category: LandingFeaturedCategory) {
    setEditingId(category.id);
    setShowForm(true);
    setForm({
      title: category.title,
      subtitle: category.subtitle,
      eventCategory: category.eventCategory ?? "",
      href: category.href ?? "",
      layout: category.layout,
      grayscale: category.grayscale,
      sortOrder: category.sortOrder,
    });
  }

  function startCreate() {
    setEditingId(null);
    setShowForm(true);
    setForm({
      ...emptyForm,
      sortOrder: categories.length,
    });
  }

  function handleSave() {
    const existing = editingId ? categories.find((c) => c.id === editingId) : null;

    saveCategory({
      id: editingId ?? undefined,
      title: form.title,
      subtitle: form.subtitle,
      eventCategory: form.eventCategory ? (form.eventCategory as typeof EventCategory.CONCERT) : null,
      href: form.href.trim() ? form.href.trim() : null,
      layout: form.layout,
      grayscale: form.grayscale,
      sortOrder: form.sortOrder,
      imageKey: existing?.imageKey ?? null,
      imageUrl: existing?.imageUrl ?? null,
    });
  }

  async function handleImageUpload(categoryId: string, file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return;
    if (file.size > 8 * 1024 * 1024) return;

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    uploadImage({
      categoryId,
      mimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
      fileBase64: base64,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-on-surface-variant">
          Bloques del grid de categorías en la home. Podés agregar, editar o quitar.
        </p>
        <Button type="button" size="sm" onClick={startCreate}>
          Nueva categoría
        </Button>
      </div>

      {showForm && (
        <div className="space-y-4 hairline-border bg-surface-container p-4">
          <h3 className="font-medium">
            {editingId ? "Editar categoría" : "Nueva categoría"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Título"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <Input
              label="Subtítulo"
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            />
            <label className="block text-sm">
              <span className="mb-1 block text-on-surface-variant">Categoría de evento (link)</span>
              <select
                className="w-full border border-white/10 bg-transparent px-3 py-2 text-sm"
                value={form.eventCategory}
                onChange={(e) => setForm((f) => ({ ...f, eventCategory: e.target.value }))}
              >
                <option value="">Sin filtro (ver todos)</option>
                {Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Link personalizado (opcional)"
              placeholder="https://..."
              value={form.href}
              onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
            />
            <label className="block text-sm">
              <span className="mb-1 block text-on-surface-variant">Tamaño en desktop</span>
              <select
                className="w-full border border-white/10 bg-transparent px-3 py-2 text-sm"
                value={form.layout}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    layout: e.target.value as "wide" | "narrow",
                  }))
                }
              >
                <option value="wide">Ancho (2/3)</option>
                <option value="narrow">Estrecho (1/3)</option>
              </select>
            </label>
            <Input
              type="number"
              label="Orden"
              min={0}
              value={form.sortOrder}
              onChange={(e) =>
                setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.grayscale}
              onChange={(e) => setForm((f) => ({ ...f, grayscale: e.target.checked }))}
            />
            Publicar en blanco y negro
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" isLoading={saving} onClick={handleSave}>
              Guardar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => {
          const layout = categoryLayoutClasses(category.layout);
          const imageSrc = resolveFeaturedCategoryImage(category, images);

          return (
            <article key={category.id} className="overflow-hidden hairline-border bg-surface-container">
              <div className={cn("relative min-h-[160px] bg-black", layout.span)}>
                <Image
                  src={imageSrc}
                  alt={category.title}
                  fill
                  unoptimized
                  className={cn("object-cover", category.grayscale && "grayscale")}
                  sizes="400px"
                />
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <h3 className="font-medium">{category.title}</h3>
                  <p className="text-sm text-on-surface-variant">{category.subtitle}</p>
                  {category.imageKey && (
                    <p className="mt-1 text-xs text-on-surface-variant">
                      Imagen legacy: {LANDING_IMAGE_LABELS[category.imageKey]}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => startEdit(category)}>
                    Editar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    isLoading={uploading && uploadTargetId === category.id}
                    onClick={() => {
                      setUploadTargetId(category.id);
                      fileRef.current?.click();
                    }}
                  >
                    Subir imagen
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    isLoading={removing}
                    onClick={() => {
                      if (confirm(`¿Eliminar "${category.title}" de la home?`)) {
                        removeCategory({ id: category.id });
                      }
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadTargetId) void handleImageUpload(uploadTargetId, file);
          e.target.value = "";
          setUploadTargetId(null);
        }}
      />

      {categories.length === 0 && (
        <p className="text-sm text-on-surface-variant">
          No hay categorías configuradas. Agregá al menos una para la home.
        </p>
      )}
    </div>
  );
}
