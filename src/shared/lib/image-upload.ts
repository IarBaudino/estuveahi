import {
  ALLOWED_MIME_TYPES,
} from "@/infrastructure/storage/storage.constants";

/** Margen bajo el límite de body en Vercel (~4.5 MB). */
export const UPLOAD_PREPARE_MAX_BYTES = 3.8 * 1024 * 1024;

export const HEIC_MIME_TYPES = ["image/heic", "image/heif"] as const;

const EXTENSION_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
};

export function resolveImageMimeType(file: {
  name: string;
  type: string;
}): string {
  const type = file.type.trim().toLowerCase();
  if (type && type !== "application/octet-stream") {
    return type;
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && ext in EXTENSION_MIME) {
    return EXTENSION_MIME[ext]!;
  }

  return type;
}

export function isAllowedUploadImage(file: { name: string; type: string }): boolean {
  const mime = resolveImageMimeType(file);
  return (
    (ALLOWED_MIME_TYPES as readonly string[]).includes(mime) ||
    (HEIC_MIME_TYPES as readonly string[]).includes(mime)
  );
}

export function isHeicImage(file: { name: string; type: string }): boolean {
  const mime = resolveImageMimeType(file);
  return (HEIC_MIME_TYPES as readonly string[]).includes(mime);
}
