import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import type { HireRequest } from "@/domain/entities/hire-request";
import type { ArgentinaProvince } from "@/domain/enums/argentina-province";
import {
  HireRequestStatus,
  type HireRequestStatus as HireStatus,
} from "@/domain/enums/hire-request-status";
import { NotFoundError } from "@/domain/errors/domain-errors";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import { getDb, getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { toDate } from "@/infrastructure/firebase/helpers";
import type { CreateHireRequestInput } from "../application/schemas/hire-request.schema";

export interface HireRequestDoc {
  name: string;
  email: string;
  phone: string | null;
  province: ArgentinaProvince;
  city: string | null;
  eventType: string;
  eventDate: string | null;
  message: string;
  status: HireStatus;
  createdAt: Date;
  updatedAt: Date;
}

function mapHireRequest(id: string, data: HireRequestDoc): HireRequest {
  return {
    id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    province: data.province,
    city: data.city,
    eventType: data.eventType,
    eventDate: data.eventDate,
    message: data.message,
    status: data.status,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function createHireRequest(
  input: CreateHireRequestInput,
): Promise<HireRequest> {
  const db = getDb();
  const id = randomUUID();
  const data: HireRequestDoc = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    province: input.province,
    city: input.city?.trim() || null,
    eventType: input.eventType.trim(),
    eventDate: input.eventDate?.trim() || null,
    message: input.message.trim(),
    status: HireRequestStatus.PENDING,
    createdAt: FieldValue.serverTimestamp() as unknown as Date,
    updatedAt: FieldValue.serverTimestamp() as unknown as Date,
  };

  await db.collection(COLLECTIONS.hireRequests).doc(id).set(data);
  return mapHireRequest(id, {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function listHireRequestsForAdmin(): Promise<HireRequest[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  try {
    const snap = await db
      .collection(COLLECTIONS.hireRequests)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    return snap.docs.map((doc) =>
      mapHireRequest(doc.id, doc.data() as HireRequestDoc),
    );
  } catch (error) {
    console.error("[listHireRequestsForAdmin]", error);
    return [];
  }
}

export async function updateHireRequestStatus(
  id: string,
  status: HireStatus,
): Promise<void> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.hireRequests).doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw new NotFoundError("Solicitud no encontrada");
  }

  await ref.update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
