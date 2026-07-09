import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { EventDoc, PhotoDoc } from "@/infrastructure/firebase/documents";
import { deletePhotoStorageFiles } from "@/infrastructure/storage/photo-storage";
import { deleteFavoritesForPhoto } from "@/features/favorites/infrastructure/favorite.repository";

async function deletePurchaseRequestsForEvent(eventId: string): Promise<void> {
  const db = getDb();
  const snap = await db
    .collection(COLLECTIONS.purchaseRequests)
    .where("eventId", "==", eventId)
    .get();

  if (snap.empty) return;

  const batch = db.batch();
  for (const doc of snap.docs) {
    batch.delete(doc.ref);
  }
  await batch.commit();
}

export async function deleteEventAssets(eventId: string): Promise<void> {
  const db = getDb();
  const photosSnap = await db
    .collection(COLLECTIONS.photos)
    .where("eventId", "==", eventId)
    .get();

  await Promise.all(
    photosSnap.docs.map(async (doc) => {
      const data = doc.data() as PhotoDoc;
      await deletePhotoStorageFiles(data);
      await deleteFavoritesForPhoto(doc.id);
      await doc.ref.delete();
    }),
  );

  await deletePurchaseRequestsForEvent(eventId);
}

export async function clearEventCoverIfPhoto(
  eventId: string,
  photoId: string,
): Promise<void> {
  const db = getDb();
  const eventRef = db.collection(COLLECTIONS.events).doc(eventId);
  const eventDoc = await eventRef.get();
  if (!eventDoc.exists) return;

  const eventData = eventDoc.data() as EventDoc;
  if (eventData.coverPhotoId !== photoId) return;

  await eventRef.update({
    coverPhotoId: null,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
