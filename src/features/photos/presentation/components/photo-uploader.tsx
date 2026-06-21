"use client";

import { useCallback, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { Upload } from "lucide-react";
import { uploadPhotoAction } from "@/features/photos/presentation/actions/photo.actions";
import type { PhotoDTO } from "@/shared/lib/photo-serialization";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from "@/infrastructure/storage/storage.constants";

/** Límite aproximado de body en route handlers de Vercel (~4.5 MB). */
const API_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;

interface PhotoUploaderProps {
  eventId: string;
  onPhotoUploaded?: (photo: PhotoDTO) => void;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("No se pudo leer el archivo"));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

async function uploadViaApi(
  file: File,
  eventId: string,
  priceCents: number | undefined,
): Promise<{ photo?: PhotoDTO; error?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("eventId", eventId);
  formData.append("filename", file.name);
  formData.append("mimeType", file.type);
  if (priceCents !== undefined) {
    formData.append("priceCents", String(priceCents));
  }

  const response = await fetch("/api/photos/upload", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { photo?: PhotoDTO; error?: string }
    | null;

  if (!response.ok) {
    return { error: payload?.error ?? "Error al subir" };
  }

  if (!payload?.photo) {
    return { error: "Respuesta inválida del servidor" };
  }

  return { photo: payload.photo };
}

export function PhotoUploader({ eventId, onPhotoUploaded }: PhotoUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [defaultPricePesos, setDefaultPricePesos] = useState("");
  const [uploads, setUploads] = useState<{ name: string; status: string }[]>([]);
  const { executeAsync } = useAction(uploadPhotoAction);

  const defaultPriceCents = defaultPricePesos.trim()
    ? Math.round(Number(defaultPricePesos) * 100)
    : undefined;

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
          setUploads((prev) => [...prev, { name: file.name, status: "Tipo no permitido" }]);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setUploads((prev) => [...prev, { name: file.name, status: "Archivo muy grande" }]);
          continue;
        }

        setUploads((prev) => [...prev, { name: file.name, status: "Subiendo..." }]);

        const priceCents =
          defaultPriceCents !== undefined && !Number.isNaN(defaultPriceCents)
            ? defaultPriceCents
            : undefined;

        try {
          if (file.size <= API_UPLOAD_MAX_BYTES) {
            const apiResult = await uploadViaApi(file, eventId, priceCents);

            if (apiResult.error) {
              setUploads((prev) =>
                prev.map((u) =>
                  u.name === file.name ? { ...u, status: apiResult.error! } : u,
                ),
              );
              continue;
            }

            if (apiResult.photo) {
              onPhotoUploaded?.(apiResult.photo);
            }

            setUploads((prev) =>
              prev.map((u) =>
                u.name === file.name ? { ...u, status: "Completado" } : u,
              ),
            );
            continue;
          }

          const base64 = await fileToBase64(file);
          const result = await executeAsync({
            eventId,
            filename: file.name,
            mimeType: file.type as (typeof ALLOWED_MIME_TYPES)[number],
            fileSize: file.size,
            fileBase64: base64,
            priceCents,
          });

          if (!result) {
            setUploads((prev) =>
              prev.map((u) =>
                u.name === file.name ? { ...u, status: "Error al subir" } : u,
              ),
            );
            continue;
          }

          if (result.serverError) {
            setUploads((prev) =>
              prev.map((u) =>
                u.name === file.name ? { ...u, status: result.serverError! } : u,
              ),
            );
            continue;
          }

          if (result.validationErrors) {
            const detail = Object.values(result.validationErrors)
              .flatMap((field) => (Array.isArray(field) ? field : field?._errors ?? []))
              .filter(Boolean)
              .join(", ");
            setUploads((prev) =>
              prev.map((u) =>
                u.name === file.name
                  ? { ...u, status: detail || "Archivo inválido" }
                  : u,
              ),
            );
            continue;
          }

          if (result.data?.photo) {
            onPhotoUploaded?.(result.data.photo);
          }

          setUploads((prev) =>
            prev.map((u) =>
              u.name === file.name ? { ...u, status: "Completado" } : u,
            ),
          );
        } catch (error) {
          console.error("[PhotoUploader]", error);
          const message =
            error instanceof Error && !/Server Components render/i.test(error.message)
              ? error.message
              : "Error al subir. Probá de nuevo o recargá la página.";
          setUploads((prev) =>
            prev.map((u) =>
              u.name === file.name ? { ...u, status: message } : u,
            ),
          );
        }
      }
    },
    [eventId, executeAsync, onPhotoUploaded, defaultPriceCents],
  );

  return (
    <div className="space-y-4">
      <Input
        type="number"
        min={0}
        step={1}
        label="Precio por defecto (pesos)"
        placeholder="Ej: 5000 — se aplica a todas las fotos que subas ahora"
        value={defaultPricePesos}
        onChange={(e) => setDefaultPricePesos(e.target.value)}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          processFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-900"
            : "border-zinc-300 dark:border-zinc-700"
        }`}
      >
        <Upload className="mx-auto h-10 w-10 text-zinc-400" />
        <p className="mt-4 font-medium">Arrastra tus fotos aquí</p>
        <p className="mt-1 text-sm text-zinc-500">JPG, PNG o WebP · Máx 25MB</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = "image/jpeg,image/png,image/webp";
            input.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files) processFiles(files);
            };
            input.click();
          }}
        >
          Seleccionar archivos
        </Button>
      </div>

      {uploads.length > 0 && (
        <ul className="space-y-2">
          {uploads.map((upload, i) => (
            <li
              key={`${upload.name}-${i}`}
              className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900"
            >
              <span className="truncate">{upload.name}</span>
              <span className="text-zinc-500">{upload.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
