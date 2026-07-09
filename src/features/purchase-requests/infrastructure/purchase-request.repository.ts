import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getDb, getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type {
  EventDoc,
  PhotoDoc,
  PhotographerProfileDoc,
  ProfileDoc,
  PurchaseRequestDoc,
} from "@/infrastructure/firebase/documents";
import { toDate } from "@/infrastructure/firebase/helpers";
import type { PurchaseRequestStatus } from "@/domain/enums/purchase-request-status";
import { NotFoundError, ValidationError } from "@/domain/errors/domain-errors";
import { isProfileComplete } from "@/shared/lib/profile";
import { getProfileById } from "@/features/profile/infrastructure/profile.repository";
import type { CreatePurchaseRequestInput } from "../application/schemas/purchase-request.schema";

export interface PurchaseRequestClientInfo {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

export interface PurchaseRequestRow {
  id: string;
  client_id: string;
  photo_id: string;
  event_id: string;
  photographer_id: string;
  status: PurchaseRequestStatus;
  message: string | null;
  quoted_price_cents: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
  photographer_archived_at: string | null;
  client_archived_at: string | null;
  photos?: {
    id: string;
    photographer_id: string;
    thumbnail_path: string;
    preview_path: string;
    original_filename: string;
    sort_order: number;
    price_cents: number | null;
  };
  events?: { id: string; title: string; slug: string };
  clients?: PurchaseRequestClientInfo;
  photographers?: { id: string; display_name: string };
}

function mapRequestRow(
  id: string,
  data: PurchaseRequestDoc,
): PurchaseRequestRow {
  return {
    id,
    client_id: data.clientId,
    photo_id: data.photoId,
    event_id: data.eventId,
    photographer_id: data.photographerId,
    status: data.status,
    message: data.message,
    quoted_price_cents: data.quotedPriceCents,
    currency: data.currency,
    created_at: toDate(data.createdAt).toISOString(),
    updated_at: toDate(data.updatedAt).toISOString(),
    photographer_archived_at: data.photographerArchivedAt
      ? toDate(data.photographerArchivedAt).toISOString()
      : null,
    client_archived_at: data.clientArchivedAt
      ? toDate(data.clientArchivedAt).toISOString()
      : null,
  };
}

async function enrichPurchaseRequests(
  requests: PurchaseRequestRow[],
): Promise<PurchaseRequestRow[]> {
  if (requests.length === 0) return [];

  const db = getDbIfConfigured();
  if (!db) return requests;

  const photoIds = [...new Set(requests.map((r) => r.photo_id))];
  const eventIds = [...new Set(requests.map((r) => r.event_id))];
  const clientIds = [...new Set(requests.map((r) => r.client_id))];

  const [photoSnaps, eventSnaps, clientSnaps] = await Promise.all([
    Promise.all(photoIds.map((id) => db.collection(COLLECTIONS.photos).doc(id).get())),
    Promise.all(eventIds.map((id) => db.collection(COLLECTIONS.events).doc(id).get())),
    Promise.all(clientIds.map((id) => db.collection(COLLECTIONS.profiles).doc(id).get())),
  ]);

  const photographerIds = [
    ...new Set(
      [
        ...requests.map((r) => r.photographer_id),
        ...photoSnaps
          .filter((d) => d.exists)
          .map((d) => (d.data() as PhotoDoc).photographerId),
      ].filter((id): id is string => Boolean(id)),
    ),
  ];

  const photographerSnaps = await Promise.all(
    photographerIds.map((id) =>
      db.collection(COLLECTIONS.photographerProfiles).doc(id).get(),
    ),
  );

  const photoMap = new Map(
    photoSnaps
      .filter((d) => d.exists)
      .map((d) => {
        const data = d.data() as PhotoDoc;
        return [
          d.id,
          {
            id: d.id,
            photographer_id: data.photographerId,
            thumbnail_path: data.thumbnailPath,
            preview_path: data.previewPath,
            original_filename: data.originalFilename,
            sort_order: data.sortOrder,
            price_cents: data.priceCents,
          },
        ];
      }),
  );

  const eventMap = new Map(
    eventSnaps
      .filter((d) => d.exists)
      .map((d) => {
        const data = d.data() as EventDoc;
        return [d.id, { id: d.id, title: data.title, slug: data.slug }];
      }),
  );

  const clientMap = new Map(
    clientSnaps
      .filter((d) => d.exists)
      .map((d) => {
        const data = d.data() as ProfileDoc;
        return [
          d.id,
          {
            id: d.id,
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            avatar_url: data.avatarUrl,
          },
        ];
      }),
  );

  const photographerMap = new Map(
    photographerSnaps
      .filter((d) => d.exists)
      .map((d) => {
        const data = d.data() as PhotographerProfileDoc;
        return [d.id, { id: d.id, display_name: data.displayName }];
      }),
  );

  return requests.map((req) => {
    const photo = photoMap.get(req.photo_id);
    const photographerId = photo?.photographer_id ?? req.photographer_id;
    return {
      ...req,
      photos: photo,
      events: eventMap.get(req.event_id),
      clients: clientMap.get(req.client_id),
      photographers: photographerId ? photographerMap.get(photographerId) : undefined,
    };
  });
}

const PHOTO_ID_QUERY_CHUNK = 30;

async function fetchRequestsByPhotoIds(
  photoIds: string[],
): Promise<PurchaseRequestRow[]> {
  if (photoIds.length === 0) return [];

  const db = getDbIfConfigured();
  if (!db) return [];

  const rows: PurchaseRequestRow[] = [];

  for (let i = 0; i < photoIds.length; i += PHOTO_ID_QUERY_CHUNK) {
    const chunk = photoIds.slice(i, i + PHOTO_ID_QUERY_CHUNK);
    const snap = await db
      .collection(COLLECTIONS.purchaseRequests)
      .where("photoId", "in", chunk)
      .get();

    rows.push(
      ...snap.docs.map((doc) =>
        mapRequestRow(doc.id, doc.data() as PurchaseRequestDoc),
      ),
    );
  }

  return rows;
}

function filterRequestsForPhotoOwner(
  requests: PurchaseRequestRow[],
  photographerId: string,
): PurchaseRequestRow[] {
  return requests.filter(
    (req) => req.photos?.photographer_id === photographerId,
  );
}

export async function createPurchaseRequest(
  clientId: string,
  input: CreatePurchaseRequestInput,
) {
  const profile = await getProfileById(clientId);
  if (!profile) throw new NotFoundError("Perfil no encontrado");

  if (
    !isProfileComplete({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
    })
  ) {
    throw new ValidationError(
      "Completá tu perfil (nombre, apellido y teléfono) antes de solicitar una foto",
    );
  }

  const db = getDb();
  const photoDoc = await db.collection(COLLECTIONS.photos).doc(input.photoId).get();

  if (!photoDoc.exists) throw new NotFoundError("Foto no encontrada");

  const photo = photoDoc.data() as PhotoDoc;
  const hasListedPrice = photo.priceCents != null && photo.priceCents > 0;
  const id = randomUUID();

  const requestData: PurchaseRequestDoc = {
    clientId,
    photoId: photoDoc.id,
    eventId: photo.eventId,
    photographerId: photo.photographerId,
    message: input.message ?? null,
    quotedPriceCents: hasListedPrice ? photo.priceCents : null,
    currency: "ARS",
    status: "pending",
    createdAt: FieldValue.serverTimestamp() as unknown as Date,
    updatedAt: FieldValue.serverTimestamp() as unknown as Date,
  };

  await db.collection(COLLECTIONS.purchaseRequests).doc(id).set(requestData);
  return { id, ...requestData };
}

export async function getClientRequests(clientId: string) {
  const db = getDbIfConfigured();
  if (!db) return [];

  const snap = await db
    .collection(COLLECTIONS.purchaseRequests)
    .where("clientId", "==", clientId)
    .get();

  const requests = snap.docs
    .map((doc) => mapRequestRow(doc.id, doc.data() as PurchaseRequestDoc))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return enrichPurchaseRequests(requests);
}

export async function getPhotographerRequests(photographerId: string) {
  const db = getDbIfConfigured();
  if (!db) return [];

  const [ownedPhotosSnap, byStoredOwnerSnap] = await Promise.all([
    db
      .collection(COLLECTIONS.photos)
      .where("photographerId", "==", photographerId)
      .get(),
    db
      .collection(COLLECTIONS.purchaseRequests)
      .where("photographerId", "==", photographerId)
      .get(),
  ]);

  const ownedPhotoIds = ownedPhotosSnap.docs.map((doc) => doc.id);
  const byPhotoId = await fetchRequestsByPhotoIds(ownedPhotoIds);

  const merged = new Map<string, PurchaseRequestRow>();
  for (const doc of byStoredOwnerSnap.docs) {
    merged.set(doc.id, mapRequestRow(doc.id, doc.data() as PurchaseRequestDoc));
  }
  for (const row of byPhotoId) {
    merged.set(row.id, row);
  }

  const requests = [...merged.values()].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  const enriched = await enrichPurchaseRequests(requests);

  return filterRequestsForPhotoOwner(enriched, photographerId);
}

export async function getAllRequestsForAdmin() {
  const db = getDbIfConfigured();
  if (!db) return [];

  const snap = await db
    .collection(COLLECTIONS.purchaseRequests)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const requests = snap.docs.map((doc) =>
    mapRequestRow(doc.id, doc.data() as PurchaseRequestDoc),
  );

  return enrichPurchaseRequests(requests);
}

export async function updateRequestStatus(
  requestId: string,
  photographerId: string,
  status: PurchaseRequestStatus,
  quotedPriceCents?: number,
) {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.purchaseRequests).doc(requestId);
  const doc = await ref.get();

  if (!doc.exists) {
    throw new NotFoundError("Solicitud no encontrada");
  }

  const data = doc.data() as PurchaseRequestDoc;
  const photoDoc = await db.collection(COLLECTIONS.photos).doc(data.photoId).get();

  if (!photoDoc.exists || (photoDoc.data() as PhotoDoc).photographerId !== photographerId) {
    throw new NotFoundError("Solicitud no encontrada");
  }

  const update: Record<string, unknown> = {
    status,
    photographerId: (photoDoc.data() as PhotoDoc).photographerId,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (quotedPriceCents !== undefined) {
    update.quotedPriceCents = quotedPriceCents;
  }

  await ref.update(update);
  const updated = await ref.get();
  return { id: updated.id, ...(updated.data() as PurchaseRequestDoc) };
}

export async function cancelRequest(requestId: string, clientId: string) {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.purchaseRequests).doc(requestId);
  const doc = await ref.get();

  if (
    !doc.exists ||
    (doc.data() as PurchaseRequestDoc).clientId !== clientId ||
    (doc.data() as PurchaseRequestDoc).status !== "pending"
  ) {
    throw new NotFoundError("Solicitud no encontrada");
  }

  await ref.update({
    status: "cancelled",
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function assertPhotographerRequest(requestId: string, photographerId: string) {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.purchaseRequests).doc(requestId);
  const doc = await ref.get();

  if (!doc.exists) {
    throw new NotFoundError("Solicitud no encontrada");
  }

  const data = doc.data() as PurchaseRequestDoc;
  const photoDoc = await db.collection(COLLECTIONS.photos).doc(data.photoId).get();

  if (!photoDoc.exists) {
    throw new NotFoundError("Solicitud no encontrada");
  }

  if ((photoDoc.data() as PhotoDoc).photographerId !== photographerId) {
    throw new NotFoundError("Solicitud no encontrada");
  }

  return ref;
}

export async function archiveRequest(requestId: string, photographerId: string): Promise<void> {
  const ref = await assertPhotographerRequest(requestId, photographerId);
  const data = (await ref.get()).data() as PurchaseRequestDoc;

  if (data.status !== "completed") {
    throw new ValidationError("Solo podés archivar pedidos ya entregados");
  }

  await ref.update({
    photographerArchivedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function unarchiveRequest(requestId: string, photographerId: string): Promise<void> {
  const ref = await assertPhotographerRequest(requestId, photographerId);
  await ref.update({
    photographerArchivedAt: null,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteRequest(requestId: string, photographerId: string): Promise<void> {
  const ref = await assertPhotographerRequest(requestId, photographerId);
  await ref.delete();
}

async function assertClientRequest(requestId: string, clientId: string) {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.purchaseRequests).doc(requestId);
  const doc = await ref.get();

  if (!doc.exists || (doc.data() as PurchaseRequestDoc).clientId !== clientId) {
    throw new NotFoundError("Solicitud no encontrada");
  }

  return { ref, data: doc.data() as PurchaseRequestDoc };
}

export async function archiveClientRequest(requestId: string, clientId: string): Promise<void> {
  const { ref, data } = await assertClientRequest(requestId, clientId);

  if (data.status !== "completed") {
    throw new ValidationError("Solo podés archivar pedidos ya entregados");
  }

  await ref.update({
    clientArchivedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function unarchiveClientRequest(requestId: string, clientId: string): Promise<void> {
  const { ref } = await assertClientRequest(requestId, clientId);
  await ref.update({
    clientArchivedAt: null,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getPendingRequestCount(photographerId: string): Promise<number> {
  try {
    const requests = await getPhotographerRequests(photographerId);
    return requests.filter(
      (req) => req.status === "pending" && !req.photographer_archived_at,
    ).length;
  } catch (error) {
    console.error("[getPendingRequestCount] failed:", error);
    return 0;
  }
}
