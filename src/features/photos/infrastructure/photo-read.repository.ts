import { getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { PhotoDoc } from "@/infrastructure/firebase/documents";
import { mapPhoto } from "@/infrastructure/mappers/photo.mapper";
import type { Photo } from "@/domain/entities/photo";
import {
  MAX_EVENT_GALLERY_PHOTOS,
  PUBLIC_GALLERY_INITIAL_PHOTOS,
} from "../application/gallery.constants";

export { MAX_EVENT_GALLERY_PHOTOS, PUBLIC_GALLERY_INITIAL_PHOTOS };

export async function getEventPhotos(
  eventId: string,
  limit = MAX_EVENT_GALLERY_PHOTOS,
  offset = 0,
): Promise<Photo[]> {
  try {
    const db = getDbIfConfigured();
    if (!db) return [];

    // Path rápido cuando pedimos pocas fotos (cards / primera página de galería).
    if (offset === 0 && limit <= 100) {
      try {
        const snap = await db
          .collection(COLLECTIONS.photos)
          .where("eventId", "==", eventId)
          .orderBy("sortOrder", "asc")
          .limit(Math.min(limit * 2, 200))
          .get();

        const photos = snap.docs
          .map((doc) => mapPhoto(doc.id, doc.data() as PhotoDoc))
          .filter((photo) => photo.isVisible)
          .slice(0, limit);

        if (photos.length > 0 || snap.empty) return photos;
      } catch (error) {
        // Sin índice compuesto caemos al scan completo.
        console.warn("[getEventPhotos] orderBy path failed, falling back:", error);
      }
    }

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
