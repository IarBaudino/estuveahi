import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getDb, getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type {
  EventDoc,
  PhotoDoc,
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
  photos?: {
    id: string;
    thumbnail_path: string;
    preview_path: string;
    original_filename: string;
    sort_order: number;
    price_cents: number | null;
  };
  events?: { id: string; title: string; slug: string };
  clients?: PurchaseRequestClientInfo;
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

  const photoMap = new Map(
    photoSnaps
      .filter((d) => d.exists)
      .map((d) => {
        const data = d.data() as PhotoDoc;
        return [
          d.id,
          {
            id: d.id,
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
            email: data.email,
            phone: data.phone,
            avatar_url: data.avatarUrl,
          },
        ];
      }),
  );

  return requests.map((req) => ({
    ...req,
    photos: photoMap.get(req.photo_id),
    events: eventMap.get(req.event_id),
    clients: clientMap.get(req.client_id),
  }));
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
    status: hasListedPrice ? "approved" : "pending",
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

  const snap = await db
    .collection(COLLECTIONS.purchaseRequests)
    .where("photographerId", "==", photographerId)
    .get();

  const requests = snap.docs
    .map((doc) => mapRequestRow(doc.id, doc.data() as PurchaseRequestDoc))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return enrichPurchaseRequests(requests);
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

  if (!doc.exists || (doc.data() as PurchaseRequestDoc).photographerId !== photographerId) {
    throw new NotFoundError("Solicitud no encontrada");
  }

  const update: Record<string, unknown> = {
    status,
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

export async function getPendingRequestCount(photographerId: string): Promise<number> {
  const db = getDbIfConfigured();
  if (!db) return 0;

  const snap = await db
    .collection(COLLECTIONS.purchaseRequests)
    .where("photographerId", "==", photographerId)
    .where("status", "==", "pending")
    .count()
    .get();

  return snap.data().count;
}
