import { getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { EventDoc, PhotoDoc } from "@/infrastructure/firebase/documents";
import { EventStatus } from "@/domain/enums/event-status";
import type { UserRole } from "@/domain/enums/roles";
import type { MediaVariant } from "@/shared/lib/media-url";
import { getBucketAndPath } from "@/infrastructure/storage/storage.constants";

export interface MediaAccessResult {
  bucket: string;
  path: string;
  contentType: string;
}

export async function resolvePhotoMediaAccess(
  photoId: string,
  variant: MediaVariant,
  viewer?: { id: string; role: UserRole },
): Promise<MediaAccessResult | null> {
  const db = getDbIfConfigured();
  if (!db) return null;

  const photoDoc = await db.collection(COLLECTIONS.photos).doc(photoId).get();
  if (!photoDoc.exists) return null;

  const photo = photoDoc.data() as PhotoDoc;

  const eventDoc = await db.collection(COLLECTIONS.events).doc(photo.eventId).get();
  const event = eventDoc.exists ? (eventDoc.data() as EventDoc) : null;

  const isOwner = viewer?.id === photo.photographerId;
  const isAdmin = viewer?.role === "admin";

  if (variant === "original") {
    if (!isOwner && !isAdmin) return null;
    const { bucket, path } = getBucketAndPath(photo.storagePath);
    return { bucket, path, contentType: photo.mimeType };
  }

  const isPublicEvent =
    event?.status === EventStatus.PUBLISHED && event?.isPublic === true;

  if (!photo.isVisible && !isOwner && !isAdmin) return null;
  if (!isPublicEvent && !isOwner && !isAdmin) return null;

  const fullPath =
    variant === "preview" ? photo.previewPath : photo.thumbnailPath;
  const { bucket, path } = getBucketAndPath(fullPath);

  return { bucket, path, contentType: "image/webp" };
}
