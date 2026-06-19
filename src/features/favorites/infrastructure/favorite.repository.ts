import { FieldValue } from "firebase-admin/firestore";
import { getDb, getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { PhotoDoc } from "@/infrastructure/firebase/documents";
import { mapPhoto } from "@/infrastructure/mappers/photo.mapper";
import type { Photo } from "@/domain/entities/photo";
import type { EventDoc } from "@/infrastructure/firebase/documents";

export interface FavoriteWithEvent extends Photo {
  eventTitle: string;
  eventSlug: string;
}

function favoriteDocId(userId: string, photoId: string) {
  return `${userId}_${photoId}`;
}

export async function getUserFavorites(userId: string): Promise<Photo[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  const favSnap = await db
    .collection(COLLECTIONS.favorites)
    .where("userId", "==", userId)
    .get();

  if (favSnap.empty) return [];

  const photoIds = favSnap.docs.map((d) => (d.data() as { photoId: string }).photoId);
  const photos = await Promise.all(
    photoIds.map(async (id) => {
      const doc = await db.collection(COLLECTIONS.photos).doc(id).get();
      if (!doc.exists) return null;
      return mapPhoto(doc.id, doc.data() as PhotoDoc);
    }),
  );

  return photos.filter((p): p is Photo => p !== null);
}

export async function isFavorite(
  userId: string,
  photoId: string,
): Promise<boolean> {
  const db = getDbIfConfigured();
  if (!db) return false;

  const doc = await db
    .collection(COLLECTIONS.favorites)
    .doc(favoriteDocId(userId, photoId))
    .get();

  return doc.exists;
}

export async function toggleFavorite(
  userId: string,
  photoId: string,
): Promise<{ favorited: boolean }> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.favorites).doc(favoriteDocId(userId, photoId));
  const existing = await ref.get();

  if (existing.exists) {
    await ref.delete();
    return { favorited: false };
  }

  await ref.set({
    userId,
    photoId,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { favorited: true };
}

export async function getUserFavoritesWithEvents(
  userId: string,
): Promise<FavoriteWithEvent[]> {
  const photos = await getUserFavorites(userId);
  if (photos.length === 0) return [];

  const db = getDbIfConfigured();
  if (!db) {
    return photos.map((p) => ({
      ...p,
      eventTitle: "Evento",
      eventSlug: "",
    }));
  }

  const eventIds = [...new Set(photos.map((p) => p.eventId))];
  const eventDocs = await Promise.all(
    eventIds.map((id) => db.collection(COLLECTIONS.events).doc(id).get()),
  );

  const eventMap = new Map(
    eventDocs
      .filter((d) => d.exists)
      .map((d) => {
        const data = d.data() as EventDoc;
        return [d.id, { title: data.title, slug: data.slug }];
      }),
  );

  return photos.map((p) => {
    const ev = eventMap.get(p.eventId);
    return {
      ...p,
      eventTitle: ev?.title ?? "Evento",
      eventSlug: ev?.slug ?? "",
    };
  });
}

export async function getUserFavoriteIds(userId: string): Promise<Set<string>> {
  const db = getDbIfConfigured();
  if (!db) return new Set();

  const snap = await db
    .collection(COLLECTIONS.favorites)
    .where("userId", "==", userId)
    .get();

  return new Set(snap.docs.map((d) => (d.data() as { photoId: string }).photoId));
}
