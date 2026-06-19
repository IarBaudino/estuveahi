export const STORAGE_BUCKETS = {
  original: "photos-original",
  preview: "photos-preview",
  thumbnail: "photos-thumbnail",
  avatars: "avatars",
  covers: "event-covers",
} as const;

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const PREVIEW_MAX_PX = 960;
export const THUMBNAIL_MAX_PX = 360;
export const PREVIEW_QUALITY = 72;
export const THUMBNAIL_QUALITY = 68;
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function buildPhotoPaths(
  photographerId: string,
  eventId: string,
  photoId: string,
  ext: string,
) {
  const base = `${photographerId}/${eventId}/${photoId}`;
  return {
    original: `${STORAGE_BUCKETS.original}/${base}/original.${ext}`,
    preview: `${STORAGE_BUCKETS.preview}/${base}/preview.webp`,
    thumbnail: `${STORAGE_BUCKETS.thumbnail}/${base}/thumb.webp`,
  };
}

export function getBucketAndPath(fullPath: string): {
  bucket: string;
  path: string;
} {
  const [bucket, ...rest] = fullPath.split("/");
  return { bucket, path: rest.join("/") };
}
