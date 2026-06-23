import { getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { EventDoc, PhotoDoc } from "@/infrastructure/firebase/documents";
import { EventStatus } from "@/domain/enums/event-status";
import type { UserRole } from "@/domain/enums/roles";
import type { MediaVariant } from "@/shared/lib/media-url";
import { getBucketAndPath } from "@/infrastructure/storage/storage.constants";
import { canManageEvent, canContributeToEvent } from "@/features/events/infrastructure/event-access";

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
  const canManage =
    viewer && event ? canManageEvent(event, viewer.id, viewer.role) : false;
  const canContribute =
    viewer && event ? canContributeToEvent(event, viewer.id, viewer.role) : false;
  const canViewPrivate = isOwner || isAdmin || canManage || canContribute;

  if (variant !== "preview" && variant !== "thumbnail") {
    return null;
  }

  const isPublicEvent =
    event?.status === EventStatus.PUBLISHED && event?.isPublic !== false;

  if (!photo.isVisible && !canViewPrivate) return null;
  if (!isPublicEvent && !canViewPrivate) return null;

  const fullPath =
    variant === "preview" ? photo.previewPath : photo.thumbnailPath;
  const { bucket, path } = getBucketAndPath(fullPath);

  return { bucket, path, contentType: "image/webp" };
}
