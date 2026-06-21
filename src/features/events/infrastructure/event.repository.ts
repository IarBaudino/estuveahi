import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { nanoid } from "nanoid";
import { getDb, getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { EventDoc, PhotographerProfileDoc } from "@/infrastructure/firebase/documents";
import {
  buildSearchKeywords,
  matchesSearch,
  toDate,
} from "@/infrastructure/firebase/helpers";
import {
  mapEvent,
  mapEventWithPhotographer,
  mapPhotographerSummary,
} from "@/infrastructure/mappers/event.mapper";
import { slugify } from "@/shared/lib/utils";
import type { Event, EventWithPhotographer } from "@/domain/entities/event";
import type {
  CreateEventInput,
  SearchEventsInput,
  UpdateEventInput,
} from "../application/schemas/event.schema";
import { EventStatus } from "@/domain/enums/event-status";
import { NotFoundError } from "@/domain/errors/domain-errors";
import type { Profile } from "@/domain/entities/user";
import { mapProfile } from "@/infrastructure/mappers/profile.mapper";
import type { ProfileDoc } from "@/infrastructure/firebase/documents";
import type { UserRole } from "@/domain/enums/roles";
import { Role } from "@/domain/enums/roles";
import { canManageEvent } from "./event-access";

async function getPhotographerSummary(photographerId: string) {
  const db = getDbIfConfigured();
  if (!db) return { id: photographerId, displayName: "Fotografx", isVerified: false };

  const doc = await db
    .collection(COLLECTIONS.photographerProfiles)
    .doc(photographerId)
    .get();

  if (!doc.exists) {
    return { id: photographerId, displayName: "Fotografx", isVerified: false };
  }

  return mapPhotographerSummary(doc.id, doc.data() as PhotographerProfileDoc);
}

export async function createEvent(
  photographerId: string,
  input: CreateEventInput,
): Promise<Event> {
  const db = getDb();
  const id = randomUUID();
  const baseSlug = slugify(input.title);
  const slug = `${baseSlug}-${nanoid(6)}`;
  const qrCode = nanoid(8);

  const eventData: EventDoc = {
    photographerId,
    title: input.title,
    slug,
    description: input.description ?? null,
    category: input.category,
    venue: input.venue ?? null,
    city: input.city ?? null,
    country: input.country,
    eventDate: new Date(input.eventDate),
    status: EventStatus.DRAFT,
    coverPhotoId: null,
    qrCode,
    isPublic: input.isPublic,
    photoCount: 0,
    searchKeywords: buildSearchKeywords(
      input.title,
      input.description,
      input.city,
      input.venue,
    ),
    createdAt: FieldValue.serverTimestamp() as unknown as Date,
    updatedAt: FieldValue.serverTimestamp() as unknown as Date,
  };

  await db.collection(COLLECTIONS.events).doc(id).set(eventData);
  return mapEvent(id, eventData);
}

async function findEventByField(
  field: "slug" | "qrCode",
  value: string,
): Promise<{ id: string; data: EventDoc } | null> {
  const db = getDbIfConfigured();
  if (!db) return null;

  const snap = await db
    .collection(COLLECTIONS.events)
    .where(field, "==", value)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return { id: doc.id, data: doc.data() as EventDoc };
}

export async function getEventBySlug(slug: string): Promise<EventWithPhotographer | null> {
  const found = await findEventByField("slug", slug);
  if (!found) return null;

  const photographer = await getPhotographerSummary(found.data.photographerId);
  return mapEventWithPhotographer(found.id, found.data, photographer);
}

export async function getEventByQrCode(qrCode: string): Promise<Event | null> {
  const found = await findEventByField("qrCode", qrCode);
  if (!found) return null;
  return mapEvent(found.id, found.data);
}

export async function getEventById(id: string): Promise<Event | null> {
  const db = getDbIfConfigured();
  if (!db) return null;

  const doc = await db.collection(COLLECTIONS.events).doc(id).get();
  if (!doc.exists) return null;
  return mapEvent(doc.id, doc.data() as EventDoc);
}

export async function getPhotographerEvents(photographerId: string): Promise<Event[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  try {
    const snap = await db
      .collection(COLLECTIONS.events)
      .where("photographerId", "==", photographerId)
      .get();

    return snap.docs
      .map((doc) => {
        try {
          return mapEvent(doc.id, doc.data() as EventDoc);
        } catch (error) {
          console.error("[getPhotographerEvents] skip invalid event:", doc.id, error);
          return null;
        }
      })
      .filter((event): event is Event => event !== null)
      .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
  } catch (error) {
    console.error("[getPhotographerEvents] query failed:", error);
    return [];
  }
}

export async function searchPublicEvents(
  input: SearchEventsInput,
): Promise<{ events: EventWithPhotographer[]; total: number }> {
  try {
    const db = getDbIfConfigured();
    if (!db) return { events: [], total: 0 };

    const snap = await db
      .collection(COLLECTIONS.events)
      .where("status", "==", EventStatus.PUBLISHED)
      .limit(200)
      .get();

    let rows = snap.docs
      .map((doc) => ({
        id: doc.id,
        data: doc.data() as EventDoc,
      }))
      .filter((row) => row.data.isPublic === true);

    if (input.category) {
      rows = rows.filter((row) => row.data.category === input.category);
    }

    if (input.city) {
    const cityLower = input.city.toLowerCase();
    rows = rows.filter((r) => r.data.city?.toLowerCase().includes(cityLower));
  }

    if (input.q) {
      rows = rows.filter((r) => matchesSearch(r.data.searchKeywords, input.q!));
    }

    rows.sort(
      (a, b) => toDate(b.data.eventDate).getTime() - toDate(a.data.eventDate).getTime(),
    );

    const total = rows.length;
    const offset = (input.page - 1) * input.limit;
    const page = rows.slice(offset, offset + input.limit);

    const photographerIds = [...new Set(page.map((r) => r.data.photographerId))];
    const photographerSnaps = await Promise.all(
      photographerIds.map((id) =>
        db.collection(COLLECTIONS.photographerProfiles).doc(id).get(),
      ),
    );

    const photographerMap = new Map(
      photographerSnaps
        .filter((d) => d.exists)
        .map((d) => [
          d.id,
          mapPhotographerSummary(d.id, d.data() as PhotographerProfileDoc),
        ]),
    );

    const events = await Promise.all(
      page.map(async (row) => {
        const photographer =
          photographerMap.get(row.data.photographerId) ??
          (await getPhotographerSummary(row.data.photographerId));
        return mapEventWithPhotographer(row.id, row.data, photographer);
      }),
    );

    return { events, total };
  } catch (error) {
    console.error("[searchPublicEvents]", error);
    return { events: [], total: 0 };
  }
}

export async function updateEvent(
  eventId: string,
  userId: string,
  input: Omit<UpdateEventInput, "id">,
  role?: UserRole,
): Promise<Event> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.events).doc(eventId);
  const doc = await ref.get();

  if (!doc.exists || !canManageEvent(doc.data() as EventDoc, userId, role)) {
    throw new NotFoundError("Evento no encontrado");
  }

  const current = doc.data() as EventDoc;
  const title = input.title ?? current.title;
  const description =
    input.description !== undefined ? (input.description ?? null) : current.description;
  const city = input.city !== undefined ? (input.city ?? null) : current.city;
  const venue = input.venue !== undefined ? (input.venue ?? null) : current.venue;

  const updates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description ?? null;
  if (input.category !== undefined) updates.category = input.category;
  if (input.venue !== undefined) updates.venue = input.venue ?? null;
  if (input.city !== undefined) updates.city = input.city ?? null;
  if (input.country !== undefined) updates.country = input.country;
  if (input.eventDate !== undefined) updates.eventDate = new Date(input.eventDate);
  if (input.isPublic !== undefined) updates.isPublic = input.isPublic;

  if (
    input.title !== undefined ||
    input.description !== undefined ||
    input.city !== undefined ||
    input.venue !== undefined
  ) {
    updates.searchKeywords = buildSearchKeywords(
      title,
      description ?? undefined,
      city ?? undefined,
      venue ?? undefined,
    );
  }

  await ref.update(updates);
  const updated = await ref.get();
  return mapEvent(updated.id, updated.data() as EventDoc);
}

export async function publishEvent(
  eventId: string,
  userId: string,
  role?: UserRole,
): Promise<Event> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.events).doc(eventId);
  const doc = await ref.get();

  if (!doc.exists || !canManageEvent(doc.data() as EventDoc, userId, role)) {
    throw new NotFoundError("Evento no encontrado");
  }

  await ref.update({
    status: EventStatus.PUBLISHED,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await ref.get();
  return mapEvent(updated.id, updated.data() as EventDoc);
}

export async function archiveEvent(
  eventId: string,
  userId: string,
  role?: UserRole,
): Promise<Event> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.events).doc(eventId);
  const doc = await ref.get();

  if (!doc.exists || !canManageEvent(doc.data() as EventDoc, userId, role)) {
    throw new NotFoundError("Evento no encontrado");
  }

  await ref.update({
    status: EventStatus.ARCHIVED,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await ref.get();
  return mapEvent(updated.id, updated.data() as EventDoc);
}

export async function deleteEvent(
  eventId: string,
  userId: string,
  role?: UserRole,
): Promise<void> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.events).doc(eventId);
  const doc = await ref.get();

  if (!doc.exists || !canManageEvent(doc.data() as EventDoc, userId, role)) {
    throw new NotFoundError("Evento no encontrado");
  }

  await ref.delete();
}

export async function getAdminStats() {
  const db = getDbIfConfigured();
  if (!db) {
    return { users: 0, events: 0, photos: 0, pendingRequests: 0 };
  }

  try {
    const [users, events, photos, requests] = await Promise.all([
      db.collection(COLLECTIONS.profiles).count().get(),
      db.collection(COLLECTIONS.events).count().get(),
      db.collection(COLLECTIONS.photos).count().get(),
      db
        .collection(COLLECTIONS.purchaseRequests)
        .where("status", "==", "pending")
        .count()
        .get(),
    ]);

    return {
      users: users.data().count,
      events: events.data().count,
      photos: photos.data().count,
      pendingRequests: requests.data().count,
    };
  } catch (error) {
    console.error("[getAdminStats] count queries failed:", error);
    return { users: 0, events: 0, photos: 0, pendingRequests: 0 };
  }
}

export async function getAllEventsForAdmin() {
  const db = getDbIfConfigured();
  if (!db) return [];

  const snap = await db
    .collection(COLLECTIONS.events)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  if (snap.empty) return [];

  const events = snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as EventDoc),
  }));

  const photographerIds = [...new Set(events.map((e) => e.photographerId))];
  const photographerSnaps = await Promise.all(
    photographerIds.map((id) =>
      db.collection(COLLECTIONS.photographerProfiles).doc(id).get(),
    ),
  );

  const photographerMap = new Map(
    photographerSnaps
      .filter((d) => d.exists)
      .map((d) => [d.id, (d.data() as PhotographerProfileDoc).displayName]),
  );

  return events.map((event) => ({
    id: event.id,
    title: event.title,
    slug: event.slug,
    status: event.status,
    photoCount: event.photoCount,
    eventDate: toDate(event.eventDate),
    photographerId: event.photographerId,
    photographerName: photographerMap.get(event.photographerId) ?? "—",
  }));
}

export async function adminArchiveEvent(eventId: string): Promise<void> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.events).doc(eventId);
  const doc = await ref.get();
  if (!doc.exists) throw new NotFoundError("Evento no encontrado");

  await ref.update({
    status: EventStatus.ARCHIVED,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function adminDeleteEvent(eventId: string): Promise<void> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.events).doc(eventId);
  const doc = await ref.get();
  if (!doc.exists) throw new NotFoundError("Evento no encontrado");

  await ref.delete();
}

export async function getAllUsersForAdmin(): Promise<Profile[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  const snap = await db
    .collection(COLLECTIONS.profiles)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return snap.docs.map((doc) => mapProfile(doc.id, doc.data() as ProfileDoc));
}

export interface AdminPhotographerOption {
  id: string;
  label: string;
  email: string;
}

export async function getPhotographersForAdmin(): Promise<AdminPhotographerOption[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  const snap = await db
    .collection(COLLECTIONS.profiles)
    .where("role", "in", [Role.PHOTOGRAPHER, Role.ADMIN])
    .limit(100)
    .get();

  if (snap.empty) return [];

  const profiles = snap.docs.map((doc) => ({
    id: doc.id,
    data: doc.data() as ProfileDoc,
  }));

  const photographerSnaps = await Promise.all(
    profiles.map((p) =>
      db.collection(COLLECTIONS.photographerProfiles).doc(p.id).get(),
    ),
  );

  return profiles.map((profile, index) => {
    const photographerDoc = photographerSnaps[index];
    const displayName = photographerDoc?.exists
      ? (photographerDoc.data() as PhotographerProfileDoc).displayName
      : profile.data.fullName;

    return {
      id: profile.id,
      label: displayName || profile.data.email,
      email: profile.data.email,
    };
  });
}
