export type MediaVariant = "thumbnail" | "preview" | "original";

export const MEDIA_VARIANTS = {
  thumbnail: "thumbnail",
  preview: "preview",
  original: "original",
} as const satisfies Record<MediaVariant, MediaVariant>;

export function getSecureMediaUrl(photoId: string, variant: MediaVariant): string {
  return `/api/media/${variant}/${photoId}`;
}
