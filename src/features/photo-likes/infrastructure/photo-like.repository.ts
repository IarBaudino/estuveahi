import { FieldValue } from "firebase-admin/firestore";
import { getDb, getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { EventDoc, PhotoDoc } from "@/infrastructure/firebase/documents";
import { NotFoundError } from "@/domain/errors/domain-errors";
import { EventStatus } from "@/domain/enums/event-status";
import { isEventListingActive } from "@/shared/lib/event-listing";

function photoLikeDocId(userId: string, photoId: string) {
  return `${userId}_${photoId}`;
}

export async function deleteLikesForPhoto(photoId: string): Promise<void> {
  const db = getDbIfConfigured();
  if (!db) return;

  const snap = await db
    .collection(COLLECTIONS.photoLikes)
    .where("photoId", "==", photoId)
    .get();

  if (snap.empty) return;

  const batch = db.batch();
  for (const doc of snap.docs) {
    batch.delete(doc.ref);
  }
  await batch.commit();
}

export async function getUserLikedIds(userId: string): Promise<Set<string>> {
  const db = getDbIfConfigured();
  if (!db) return new Set();

  const snap = await db
    .collection(COLLECTIONS.photoLikes)
    .where("userId", "==", userId)
    .get();

  return new Set(snap.docs.map((d) => (d.data() as { photoId: string }).photoId));
}

export async function togglePhotoLike(
  userId: string,
  photoId: string,
): Promise<{ liked: boolean; likeCount: number; eventId: string }> {
  const db = getDb();
  const likeRef = db.collection(COLLECTIONS.photoLikes).doc(photoLikeDocId(userId, photoId));
  const photoRef = db.collection(COLLECTIONS.photos).doc(photoId);

  return db.runTransaction(async (tx) => {
    const [likeDoc, photoDoc] = await Promise.all([tx.get(likeRef), tx.get(photoRef)]);

    if (!photoDoc.exists) {
      throw new NotFoundError("Foto no encontrada");
    }

    const photoData = photoDoc.data() as PhotoDoc;
    const currentCount = photoData.likeCount ?? 0;

    if (likeDoc.exists) {
      const nextCount = Math.max(0, currentCount - 1);
      tx.delete(likeRef);
      tx.update(photoRef, { likeCount: nextCount });
      return { liked: false, likeCount: nextCount, eventId: photoData.eventId };
    }

    const nextCount = currentCount + 1;
    tx.set(likeRef, {
      userId,
      photoId,
      eventId: photoData.eventId,
      createdAt: FieldValue.serverTimestamp(),
    });
    tx.update(photoRef, { likeCount: nextCount });
    return { liked: true, likeCount: nextCount, eventId: photoData.eventId };
  });
}

export async function getTotalPhotoLikes(): Promise<number> {
  const db = getDbIfConfigured();
  if (!db) return 0;

  try {
    const snap = await db.collection(COLLECTIONS.photoLikes).count().get();
    return snap.data().count;
  } catch (error) {
    console.error("[getTotalPhotoLikes] count failed:", error);
    try {
      const snap = await db.collection(COLLECTIONS.photoLikes).get();
      return snap.size;
    } catch {
      return 0;
    }
  }
}

export interface RankedPhoto {
  id: string;
  likeCount: number;
  sortOrder: number;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  photographerId: string;
}

async function fetchTopVisiblePhotos(limit: number): Promise<{ id: string; data: PhotoDoc }[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  try {
    const snap = await db
      .collection(COLLECTIONS.photos)
      .where("isVisible", "==", true)
      .orderBy("likeCount", "desc")
      .limit(limit)
      .get();

    return snap.docs.map((doc) => ({ id: doc.id, data: doc.data() as PhotoDoc }));
  } catch (error) {
    console.error("[getTopPhotosByLikes] indexed query failed, falling back:", error);

    const snap = await db.collection(COLLECTIONS.photos).where("isVisible", "==", true).limit(300).get();

    return snap.docs
      .map((doc) => ({ id: doc.id, data: doc.data() as PhotoDoc }))
      .sort((a, b) => (b.data.likeCount ?? 0) - (a.data.likeCount ?? 0))
      .slice(0, limit);
  }
}

export async function getTopPhotosByLikes(
  limit = 12,
  options?: { minLikes?: number; onlyActiveEvents?: boolean },
): Promise<RankedPhoto[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  const minLikes = options?.minLikes ?? 0;
  const onlyActiveEvents = options?.onlyActiveEvents ?? false;
  const overfetch = onlyActiveEvents ? limit * 4 : limit;

  const candidates = await fetchTopVisiblePhotos(Math.max(overfetch, limit));
  if (candidates.length === 0) return [];

  const eventIds = [...new Set(candidates.map((row) => row.data.eventId))];
  const eventSnaps = await Promise.all(
    eventIds.map((id) => db.collection(COLLECTIONS.events).doc(id).get()),
  );

  const eventMap = new Map(
    eventSnaps
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data() as EventDoc;
        return [
          doc.id,
          {
            title: data.title,
            slug: data.slug,
            isActive:
              data.status === EventStatus.PUBLISHED &&
              data.isPublic !== false &&
              isEventListingActive(data),
          },
        ];
      }),
  );

  const ranked: RankedPhoto[] = [];

  for (const row of candidates) {
    const likeCount = row.data.likeCount ?? 0;
    if (likeCount < minLikes) continue;

    const event = eventMap.get(row.data.eventId);
    if (!event) continue;
    if (onlyActiveEvents && !event.isActive) continue;

    ranked.push({
      id: row.id,
      likeCount,
      sortOrder: row.data.sortOrder,
      eventId: row.data.eventId,
      eventTitle: event.title,
      eventSlug: event.slug,
      photographerId: row.data.photographerId,
    });

    if (ranked.length >= limit) break;
  }

  return ranked;
}
