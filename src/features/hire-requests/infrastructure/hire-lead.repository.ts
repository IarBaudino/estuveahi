import { FieldValue } from "firebase-admin/firestore";
import type {
  HireLead,
  HireLeadPhotographerSummary,
  HireLeadWithRequest,
} from "@/domain/entities/hire-lead";
import type { HireRequest } from "@/domain/entities/hire-request";
import type { ArgentinaProvince } from "@/domain/enums/argentina-province";
import {
  HireLeadStatus,
  type HireLeadStatus as LeadStatus,
} from "@/domain/enums/hire-lead-status";
import { HireRequestStatus } from "@/domain/enums/hire-request-status";
import { PhotographerApplicationStatus } from "@/domain/enums/photographer-application-status";
import { NotFoundError, ValidationError } from "@/domain/errors/domain-errors";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import { getDb, getDbIfConfigured } from "@/infrastructure/firebase/admin";
import type {
  PhotographerProfileDoc,
  ProfileDoc,
} from "@/infrastructure/firebase/documents";
import { toDate } from "@/infrastructure/firebase/helpers";
import type { HireRequestDoc } from "./hire-request.repository";

export interface HireLeadDoc {
  hireRequestId: string;
  photographerId: string;
  status: LeadStatus;
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

function mapHireLead(id: string, data: HireLeadDoc): HireLead {
  return {
    id,
    hireRequestId: data.hireRequestId,
    photographerId: data.photographerId,
    status: data.status,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function leadDocId(hireRequestId: string, photographerId: string) {
  return `${hireRequestId}_${photographerId}`;
}

export async function getHireRequestById(id: string): Promise<HireRequest | null> {
  const db = getDbIfConfigured();
  if (!db) return null;
  const doc = await db.collection(COLLECTIONS.hireRequests).doc(id).get();
  if (!doc.exists) return null;
  return mapHireRequest(doc.id, doc.data() as HireRequestDoc);
}

export async function listLeadsForHireRequest(
  hireRequestId: string,
): Promise<HireLead[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  try {
    const snap = await db
      .collection(COLLECTIONS.hireLeads)
      .where("hireRequestId", "==", hireRequestId)
      .limit(100)
      .get();

    return snap.docs.map((doc) => mapHireLead(doc.id, doc.data() as HireLeadDoc));
  } catch (error) {
    console.error("[listLeadsForHireRequest]", error);
    return [];
  }
}

export async function listPhotographersAvailableForHire(): Promise<
  Omit<HireLeadPhotographerSummary, "alreadyNotified" | "leadStatus">[]
> {
  const db = getDbIfConfigured();
  if (!db) return [];

  try {
    const photoSnap = await db
      .collection(COLLECTIONS.photographerProfiles)
      .limit(300)
      .get();

    const candidates = photoSnap.docs
      .map((doc) => ({ id: doc.id, data: doc.data() as PhotographerProfileDoc }))
      .filter((row) => {
        if (row.data.applicationStatus === PhotographerApplicationStatus.PENDING) {
          return false;
        }
        if (row.data.applicationStatus === PhotographerApplicationStatus.REJECTED) {
          return false;
        }
        if (row.data.availableForHire !== true) return false;
        return (row.data.coverageProvinces ?? []).length > 0;
      });

    const profileSnaps = await Promise.all(
      candidates.map((row) => db.collection(COLLECTIONS.profiles).doc(row.id).get()),
    );

    return candidates.map((row, index) => {
      const profile = profileSnaps[index]?.data() as ProfileDoc | undefined;
      return {
        id: row.id,
        displayName: row.data.displayName,
        phone: profile?.phone ?? null,
        email: profile?.email ?? null,
        isVerified: row.data.isVerified,
        coverageProvinces: row.data.coverageProvinces ?? [],
        availableForHire: true,
      };
    });
  } catch (error) {
    console.error("[listPhotographersAvailableForHire]", error);
    return [];
  }
}

export async function listPhotographersForHireProvince(
  province: ArgentinaProvince,
  hireRequestId?: string,
): Promise<HireLeadPhotographerSummary[]> {
  const [all, leads] = await Promise.all([
    listPhotographersAvailableForHire(),
    hireRequestId ? listLeadsForHireRequest(hireRequestId) : Promise.resolve([]),
  ]);

  const leadByPhotographer = new Map(
    leads.map((lead) => [lead.photographerId, lead]),
  );

  return all
    .filter((row) => row.coverageProvinces.includes(province))
    .map((row) => {
      const lead = leadByPhotographer.get(row.id);
      return {
        ...row,
        alreadyNotified: Boolean(lead),
        leadStatus: lead?.status ?? null,
      };
    });
}

export async function notifyPhotographersOfHireRequest(
  hireRequestId: string,
  photographerIds: string[],
): Promise<{ created: number; skipped: number }> {
  const db = getDb();
  const requestRef = db.collection(COLLECTIONS.hireRequests).doc(hireRequestId);
  const requestDoc = await requestRef.get();
  if (!requestDoc.exists) {
    throw new NotFoundError("Consulta no encontrada");
  }

  const uniqueIds = [...new Set(photographerIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    throw new ValidationError("Elegí al menos un fotografx");
  }

  let created = 0;
  let skipped = 0;
  const batch = db.batch();

  for (const photographerId of uniqueIds) {
    const id = leadDocId(hireRequestId, photographerId);
    const ref = db.collection(COLLECTIONS.hireLeads).doc(id);
    const existing = await ref.get();
    if (existing.exists) {
      skipped += 1;
      continue;
    }

    const data: HireLeadDoc = {
      hireRequestId,
      photographerId,
      status: HireLeadStatus.NOTIFIED,
      createdAt: FieldValue.serverTimestamp() as unknown as Date,
      updatedAt: FieldValue.serverTimestamp() as unknown as Date,
    };
    batch.set(ref, data);
    created += 1;
  }

  if (created > 0) {
    await batch.commit();
    const current = requestDoc.data() as HireRequestDoc;
    if (current.status === HireRequestStatus.PENDING) {
      await requestRef.update({
        status: HireRequestStatus.CONTACTED,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  return { created, skipped };
}

export async function listHireLeadsForPhotographer(
  photographerId: string,
): Promise<HireLeadWithRequest[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  try {
    const snap = await db
      .collection(COLLECTIONS.hireLeads)
      .where("photographerId", "==", photographerId)
      .limit(100)
      .get();

    if (snap.empty) return [];

    const leads = snap.docs.map((doc) =>
      mapHireLead(doc.id, doc.data() as HireLeadDoc),
    );

    const requestSnaps = await Promise.all(
      leads.map((lead) =>
        db.collection(COLLECTIONS.hireRequests).doc(lead.hireRequestId).get(),
      ),
    );

    return leads
      .map((lead, index) => {
        const requestDoc = requestSnaps[index];
        if (!requestDoc?.exists) return null;
        return {
          ...lead,
          request: mapHireRequest(
            requestDoc.id,
            requestDoc.data() as HireRequestDoc,
          ),
        };
      })
      .filter((row): row is HireLeadWithRequest => row !== null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("[listHireLeadsForPhotographer]", error);
    return [];
  }
}

export async function updateHireLeadStatus(
  leadId: string,
  photographerId: string,
  status: LeadStatus,
): Promise<void> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.hireLeads).doc(leadId);
  const doc = await ref.get();
  if (!doc.exists) {
    throw new NotFoundError("Aviso no encontrado");
  }

  const data = doc.data() as HireLeadDoc;
  if (data.photographerId !== photographerId) {
    throw new NotFoundError("Aviso no encontrado");
  }

  await ref.update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  });
}
