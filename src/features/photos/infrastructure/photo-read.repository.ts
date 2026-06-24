import { getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { PhotoDoc } from "@/infrastructure/firebase/documents";
import { mapPhoto } from "@/infrastructure/mappers/photo.mapper";
import type { Photo } from "@/domain/entities/photo";

/** Máximo de fotos visibles por galería (público y panel). */
export const MAX_EVENT_GALLERY_PHOTOS = 2000;

export async function getEventPhotos(
  eventId: string,
  limit = MAX_EVENT_GALLERY_PHOTOS,
  offset = 0,
): Promise<Photo[]> {
  try {
    const db = getDbIfConfigured();
    if (!db) return [];

    const snap = await db
      .collection(COLLECTIONS.photos)
      .where("eventId", "==", eventId)
      .get();

    return snap.docs
      .map((doc) => mapPhoto(doc.id, doc.data() as PhotoDoc))
      .filter((photo) => photo.isVisible)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(offset, offset + limit);
  } catch (error) {
    console.error("[getEventPhotos]", error);
    return [];
  }
}

export async function getPhotoById(photoId: string): Promise<Photo | null> {
  const db = getDbIfConfigured();
  if (!db) return null;

  const doc = await db.collection(COLLECTIONS.photos).doc(photoId).get();
  if (!doc.exists) return null;
  return mapPhoto(doc.id, doc.data() as PhotoDoc);
}

export async function getPhotographerPhotoCount(photographerId: string): Promise<number> {
  const db = getDbIfConfigured();
  if (!db) return 0;

  try {
    const snap = await db
      .collection(COLLECTIONS.photos)
      .where("photographerId", "==", photographerId)
      .count()
      .get();

    return snap.data().count;
  } catch (error) {
    console.error("[getPhotographerPhotoCount] count query failed:", error);

    try {
      const snap = await db
        .collection(COLLECTIONS.photos)
        .where("photographerId", "==", photographerId)
        .get();

      return snap.size;
    } catch (fallbackError) {
      console.error("[getPhotographerPhotoCount] fallback failed:", fallbackError);
      return 0;
    }
  }
}
