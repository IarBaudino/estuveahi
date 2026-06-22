import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { PhotoDoc, EventDoc } from "@/infrastructure/firebase/documents";
import { mapPhoto } from "@/infrastructure/mappers/photo.mapper";
import type { UserRole } from "@/domain/enums/roles";
import { canManageEvent } from "@/features/events/infrastructure/event-access";
import {
  buildPhotoPaths,
  ALLOWED_MIME_TYPES,
} from "@/infrastructure/storage/storage.constants";
import {
  processAndUploadVariants,
} from "@/infrastructure/storage/image-processor";
import type { Photo } from "@/domain/entities/photo";
import { NotFoundError, ValidationError } from "@/domain/errors/domain-errors";
import type { UploadPhotoInput } from "../application/schemas/photo.schema";

export {
  getEventPhotos,
  getPhotoById,
  getPhotographerPhotoCount,
} from "./photo-read.repository";

export async function uploadPhoto(
  actorId: string,
  input: UploadPhotoInput,
  fileBuffer: Buffer,
  role?: UserRole,
): Promise<Photo> {
  if (!ALLOWED_MIME_TYPES.includes(input.mimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
    throw new ValidationError("Tipo de archivo no permitido");
  }

  const db = getDb();
  const eventRef = db.collection(COLLECTIONS.events).doc(input.eventId);
  const eventDoc = await eventRef.get();

  if (!eventDoc.exists) throw new NotFoundError("Evento no encontrado");

  const eventData = eventDoc.data() as EventDoc;
  if (!canManageEvent(eventData, actorId, role)) {
    throw new NotFoundError("Evento no encontrado");
  }

  const photographerId = eventData.photographerId;

  const photoId = randomUUID();
  const paths = buildPhotoPaths(photographerId, input.eventId, photoId, "");

  let width: number;
  let height: number;

  try {
    ({ width, height } = await processAndUploadVariants(
      fileBuffer,
      {
        preview: paths.preview,
        thumbnail: paths.thumbnail,
      },
      photoId,
    ));
  } catch (error) {
    console.error("[uploadPhoto] storage:", error);
    const message =
      error instanceof Error && /bucket|not found|404/i.test(error.message)
        ? "Almacenamiento no configurado. Contactá al administrador."
        : "No se pudo procesar la imagen. Probá con JPG, PNG o WebP.";
    throw new ValidationError(message);
  }

  const photosSnap = await db
    .collection(COLLECTIONS.photos)
    .where("eventId", "==", input.eventId)
    .get();

  const maxOrder = photosSnap.docs.reduce((max, doc) => {
    const order = (doc.data() as PhotoDoc).sortOrder;
    return order > max ? order : max;
  }, -1);

  const sortOrder = maxOrder + 1;

  const photoData: PhotoDoc = {
    eventId: input.eventId,
    photographerId,
    storagePath: "",
    thumbnailPath: paths.thumbnail,
    previewPath: paths.preview,
    originalFilename: input.filename,
    mimeType: input.mimeType,
    width,
    height,
    fileSizeBytes: input.fileSize,
    priceCents: input.priceCents ?? null,
    currency: "ARS",
    isVisible: true,
    sortOrder,
    capturedAt: null,
    metadata: {},
    createdAt: FieldValue.serverTimestamp() as unknown as Date,
  };

  await db.collection(COLLECTIONS.photos).doc(photoId).set(photoData);

  const newCount = photosSnap.size + 1;
  const updates: Record<string, unknown> = {
    photoCount: newCount,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (newCount === 1) {
    updates.coverPhotoId = photoId;
  }

  await eventRef.update(updates);

  const saved = await db.collection(COLLECTIONS.photos).doc(photoId).get();
  if (!saved.exists) {
    throw new ValidationError("No se pudo guardar la foto");
  }

  return mapPhoto(saved.id, saved.data() as PhotoDoc);
}

export async function deletePhoto(
  photoId: string,
  actorId: string,
  role?: UserRole,
): Promise<void> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.photos).doc(photoId);
  const doc = await ref.get();

  if (!doc.exists) throw new NotFoundError("Foto no encontrada");

  const photo = doc.data() as PhotoDoc;
  const eventDoc = await db.collection(COLLECTIONS.events).doc(photo.eventId).get();

  if (
    !eventDoc.exists ||
    !canManageEvent(eventDoc.data() as EventDoc, actorId, role)
  ) {
    throw new NotFoundError("Foto no encontrada");
  }

  await ref.delete();

  const currentCount = (eventDoc.data() as EventDoc).photoCount;
  await db.collection(COLLECTIONS.events).doc(photo.eventId).update({
    photoCount: Math.max(0, currentCount - 1),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function updatePhotoPrice(
  photoId: string,
  eventId: string,
  actorId: string,
  priceCents: number | null,
  role?: UserRole,
): Promise<Photo> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.photos).doc(photoId);
  const doc = await ref.get();

  if (!doc.exists || (doc.data() as PhotoDoc).eventId !== eventId) {
    throw new NotFoundError("Foto no encontrada");
  }

  const eventDoc = await db.collection(COLLECTIONS.events).doc(eventId).get();
  if (
    !eventDoc.exists ||
    !canManageEvent(eventDoc.data() as EventDoc, actorId, role)
  ) {
    throw new NotFoundError("Foto no encontrada");
  }

  await ref.update({ priceCents });
  const updated = await ref.get();
  return mapPhoto(updated.id, updated.data() as PhotoDoc);
}

