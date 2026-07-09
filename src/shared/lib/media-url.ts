export type MediaVariant = "thumbnail" | "preview";

/** Versión de la marca de agua — cambiar para invalidar caché del navegador */
const WATERMARK_VERSION = "4";

export const MEDIA_VARIANTS = {
  thumbnail: "thumbnail",
  preview: "preview",
} as const satisfies Record<MediaVariant, MediaVariant>;

export function getSecureMediaUrl(photoId: string, variant: MediaVariant): string {
  return `/api/media/${variant}/${photoId}?wm=${WATERMARK_VERSION}`;
}
