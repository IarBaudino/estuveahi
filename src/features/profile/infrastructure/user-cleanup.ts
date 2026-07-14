import { getDb, getFirebaseAuth } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { PhotoDoc, ProfileDoc } from "@/infrastructure/firebase/documents";
import { ForbiddenError, NotFoundError, ValidationError } from "@/domain/errors/domain-errors";
import { Role } from "@/domain/enums/roles";
import { deleteEventAssets, clearEventCoverIfPhoto } from "@/features/events/infrastructure/event-cleanup";
import { deletePhotoStorageFiles } from "@/infrastructure/storage/photo-storage";
import { deleteFavoritesForPhoto } from "@/features/favorites/infrastructure/favorite.repository";
import { deleteLikesForPhoto } from "@/features/photo-likes/infrastructure/photo-like.repository";
import { deleteFile } from "@/infrastructure/supabase/storage";
import { STORAGE_BUCKETS } from "@/infrastructure/storage/storage.constants";

async function deleteQueryDocs(
  collection: string,
  field: string,
  value: string,
): Promise<number> {
  const db = getDb();
  const snap = await db.collection(collection).where(field, "==", value).get();
  if (snap.empty) return 0;

  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = db.batch();
    for (const doc of docs.slice(i, i + 400)) {
      batch.delete(doc.ref);
    }
    await batch.commit();
  }
  return docs.length;
}

async function deleteUserFavorites(userId: string): Promise<void> {
  await deleteQueryDocs(COLLECTIONS.favorites, "userId", userId);
}

async function deleteUserPhotoLikes(userId: string): Promise<void> {
  const db = getDb();
  const snap = await db
    .collection(COLLECTIONS.photoLikes)
    .where("userId", "==", userId)
    .get();

  if (snap.empty) return;

  for (const likeDoc of snap.docs) {
    const photoId = (likeDoc.data() as { photoId?: string }).photoId;
    const photoRef = photoId ? db.collection(COLLECTIONS.photos).doc(photoId) : null;

    await db.runTransaction(async (tx) => {
      const freshLike = await tx.get(likeDoc.ref);
      if (!freshLike.exists) return;

      if (photoRef) {
        const photoSnap = await tx.get(photoRef);
        if (photoSnap.exists) {
          const count = (photoSnap.data() as PhotoDoc).likeCount ?? 0;
          tx.update(photoRef, { likeCount: Math.max(0, count - 1) });
        }
      }
      tx.delete(likeDoc.ref);
    });
  }
}

async function deletePurchaseRequestsForUser(userId: string): Promise<void> {
  await deleteQueryDocs(COLLECTIONS.purchaseRequests, "clientId", userId);
  await deleteQueryDocs(COLLECTIONS.purchaseRequests, "photographerId", userId);
}

async function deleteHireLeadsForPhotographer(userId: string): Promise<void> {
  await deleteQueryDocs(COLLECTIONS.hireLeads, "photographerId", userId);
}

async function deleteOwnedEvents(userId: string): Promise<void> {
  const db = getDb();
  const snap = await db
    .collection(COLLECTIONS.events)
    .where("photographerId", "==", userId)
    .get();

  for (const doc of snap.docs) {
    await deleteEventAssets(doc.id);
    await doc.ref.delete();
  }
}

async function deleteRemainingPhotosByPhotographer(userId: string): Promise<void> {
  const db = getDb();
  const snap = await db
    .collection(COLLECTIONS.photos)
    .where("photographerId", "==", userId)
    .get();

  for (const doc of snap.docs) {
    const data = doc.data() as PhotoDoc;
    await deletePhotoStorageFiles(data);
    await deleteFavoritesForPhoto(doc.id);
    await deleteLikesForPhoto(doc.id);
    await clearEventCoverIfPhoto(data.eventId, doc.id);
    await doc.ref.delete();
  }
}

async function deleteAvatarFiles(userId: string): Promise<void> {
  for (const ext of ["jpg", "jpeg", "png", "webp"] as const) {
    try {
      await deleteFile(STORAGE_BUCKETS.avatars, `${userId}/avatar.${ext}`);
    } catch {
      // ignore missing variants
    }
  }
}

/**
 * Borra cuenta Auth + datos asociados (irreversible).
 * No permite borrar admins ni la propia cuenta del operador.
 */
export async function deleteUserCompletely(
  userId: string,
  actorId: string,
): Promise<void> {
  if (userId === actorId) {
    throw new ValidationError("No podés eliminar tu propia cuenta");
  }

  const db = getDb();
  const profileRef = db.collection(COLLECTIONS.profiles).doc(userId);
  const profileDoc = await profileRef.get();

  if (!profileDoc.exists) {
    throw new NotFoundError("Usuario no encontrado");
  }

  const profile = profileDoc.data() as ProfileDoc;
  if (profile.role === Role.ADMIN) {
    throw new ForbiddenError("No se pueden eliminar cuentas de administrador");
  }

  await deleteOwnedEvents(userId);
  await deleteRemainingPhotosByPhotographer(userId);
  await deletePurchaseRequestsForUser(userId);
  await deleteHireLeadsForPhotographer(userId);
  await deleteUserFavorites(userId);
  await deleteUserPhotoLikes(userId);
  await deleteAvatarFiles(userId);

  await db.collection(COLLECTIONS.photographerProfiles).doc(userId).delete().catch(() => undefined);
  await profileRef.delete();

  try {
    await getFirebaseAuth().deleteUser(userId);
  } catch (error) {
    console.error("[deleteUserCompletely] Auth delete:", error);
    throw new ValidationError(
      "Se borraron los datos, pero no se pudo eliminar la cuenta de acceso. Revisá Firebase Auth.",
    );
  }
}
