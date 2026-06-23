"use client";

import { useCallback, useRef, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { Camera, ImagePlus, Upload } from "lucide-react";
import { uploadPhotoAction } from "@/features/photos/presentation/actions/photo.actions";
import type { PhotoDTO } from "@/shared/lib/photo-serialization";
import { resolveImageMimeType, isAllowedUploadImage, UPLOAD_PREPARE_MAX_BYTES } from "@/shared/lib/image-upload";
import { prepareClientImageUpload } from "@/shared/lib/prepare-client-image-upload";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { MAX_FILE_SIZE } from "@/infrastructure/storage/storage.constants";

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
  formData.append("mimeType", resolveImageMimeType(file));
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

function resetFileInput(input: HTMLInputElement | null) {
  if (input) input.value = "";
}

export function PhotoUploader({ eventId, onPhotoUploaded }: PhotoUploaderProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
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

      for (const rawFile of fileArray) {
        const displayName = rawFile.name || "foto";

        if (!isAllowedUploadImage(rawFile)) {
          setUploads((prev) => [
            ...prev,
            { name: displayName, status: "Tipo no permitido" },
          ]);
          continue;
        }

        if (rawFile.size > MAX_FILE_SIZE) {
          setUploads((prev) => [
            ...prev,
            { name: displayName, status: "Archivo muy grande" },
          ]);
          continue;
        }

        setUploads((prev) => [...prev, { name: displayName, status: "Preparando..." }]);

        const priceCents =
          defaultPriceCents !== undefined && !Number.isNaN(defaultPriceCents)
            ? defaultPriceCents
            : undefined;

        let file: File;
        try {
          file = await prepareClientImageUpload(rawFile);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "No se pudo preparar la imagen";
          setUploads((prev) =>
            prev.map((u) => (u.name === displayName ? { ...u, status: message } : u)),
          );
          continue;
        }

        const mimeType = resolveImageMimeType(file);
        setUploads((prev) =>
          prev.map((u) => (u.name === displayName ? { ...u, status: "Subiendo..." } : u)),
        );

        try {
          if (file.size <= UPLOAD_PREPARE_MAX_BYTES) {
            const apiResult = await uploadViaApi(file, eventId, priceCents);

            if (apiResult.error) {
              setUploads((prev) =>
                prev.map((u) =>
                  u.name === displayName ? { ...u, status: apiResult.error! } : u,
                ),
              );
              continue;
            }

            if (apiResult.photo) {
              onPhotoUploaded?.(apiResult.photo);
            }

            setUploads((prev) =>
              prev.map((u) =>
                u.name === displayName ? { ...u, status: "Completado" } : u,
              ),
            );
            continue;
          }

          const base64 = await fileToBase64(file);
          const result = await executeAsync({
            eventId,
            filename: file.name,
            mimeType: mimeType as "image/jpeg" | "image/png" | "image/webp",
            fileSize: file.size,
            fileBase64: base64,
            priceCents,
          });

          if (!result) {
            setUploads((prev) =>
              prev.map((u) =>
                u.name === displayName ? { ...u, status: "Error al subir" } : u,
              ),
            );
            continue;
          }

          if (result.serverError) {
            setUploads((prev) =>
              prev.map((u) =>
                u.name === displayName ? { ...u, status: result.serverError! } : u,
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
                u.name === displayName
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
              u.name === displayName ? { ...u, status: "Completado" } : u,
            ),
          );
        } catch (error) {
          console.error("[PhotoUploader]", error);
          const message =
            error instanceof Error && !/Server Components render/i.test(error.message)
              ? error.message
              : "Error al subir. Probá de nuevo o recargá la página.";
          setUploads((prev) =>
            prev.map((u) => (u.name === displayName ? { ...u, status: message } : u)),
          );
        }
      }
    },
    [eventId, executeAsync, onPhotoUploaded, defaultPriceCents],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files?.length) {
        void processFiles(files);
      }
      resetFileInput(event.target);
    },
    [processFiles],
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

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="sr-only"
        onChange={handleInputChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleInputChange}
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
          void processFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-900"
            : "border-zinc-300 dark:border-zinc-700"
        }`}
      >
        <Upload className="mx-auto h-10 w-10 text-zinc-400" />
        <p className="mt-4 font-medium">Subí tus fotos</p>
        <p className="mt-1 text-sm text-zinc-500">
          Desde el celular o la compu · JPG, PNG, WebP y fotos de iPhone (HEIC)
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            Tomar foto
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => galleryInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            Elegir de galería
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="hidden sm:inline-flex"
            onClick={() => galleryInputRef.current?.click()}
          >
            Seleccionar archivos
          </Button>
        </div>
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
