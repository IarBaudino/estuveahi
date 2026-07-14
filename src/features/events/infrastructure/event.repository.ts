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
import {
  ARGENTINA_PROVINCE_LABELS,
  cityMatchesProvince,
  type ArgentinaProvince,
} from "@/domain/enums/argentina-province";
import { NotFoundError } from "@/domain/errors/domain-errors";
import type { Profile } from "@/domain/entities/user";
import { mapProfile } from "@/infrastructure/mappers/profile.mapper";
import type { ProfileDoc } from "@/infrastructure/firebase/documents";
import type { UserRole } from "@/domain/enums/roles";
import { Role } from "@/domain/enums/roles";
import { businessConfig } from "@/config/business";
import { isEventListingActive, resolveEventListingDates } from "@/shared/lib/event-listing";
import {
  clearEventCoverIfPhoto,
  deleteEventAssets,
} from "@/features/events/infrastructure/event-cleanup";
import { canManageEvent } from "./event-access";
import { getTotalPhotoLikes } from "@/features/photo-likes/infrastructure/photo-like.repository";

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

  const province = input.province ?? null;
  const provinceLabel = province ? ARGENTINA_PROVINCE_LABELS[province] : null;

  const eventData: EventDoc = {
    photographerId,
    title: input.title,
    slug,
    description: input.description ?? null,
    category: input.category,
    venue: input.venue ?? null,
    city: input.city ?? null,
    province,
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
      provinceLabel,
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
    const [ownSnap, publishedSnap] = await Promise.all([
      db.collection(COLLECTIONS.events).where("photographerId", "==", photographerId).get(),
      db
        .collection(COLLECTIONS.events)
        .where("status", "==", EventStatus.PUBLISHED)
        .get(),
    ]);

    const events = new Map<string, Event>();

    for (const doc of ownSnap.docs) {
      try {
        events.set(doc.id, mapEvent(doc.id, doc.data() as EventDoc));
      } catch (error) {
        console.error("[getPhotographerEvents] skip invalid own event:", doc.id, error);
      }
    }

    for (const doc of publishedSnap.docs) {
      const data = doc.data() as EventDoc;
      if (data.photographerId === photographerId) continue;
      try {
        events.set(doc.id, mapEvent(doc.id, data));
      } catch (error) {
        console.error("[getPhotographerEvents] skip invalid published event:", doc.id, error);
      }
    }

    return [...events.values()].sort(
      (a, b) => b.eventDate.getTime() - a.eventDate.getTime(),
    );
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
      .filter((row) => row.data.isPublic !== false)
      .filter((row) => isEventListingActive(row.data));

    if (input.category) {
      rows = rows.filter((row) => row.data.category === input.category);
    }

    if (input.province) {
      const province = input.province;
      rows = rows.filter((row) => {
        const eventProvince = row.data.province as ArgentinaProvince | null | undefined;
        if (eventProvince === province) return true;
        if (eventProvince) return false;
        return cityMatchesProvince(row.data.city, province);
      });
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
  const province =
    input.province !== undefined ? (input.province ?? null) : (current.province ?? null);
  const provinceLabel = province
    ? ARGENTINA_PROVINCE_LABELS[province as ArgentinaProvince]
    : null;

  const updates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description ?? null;
  if (input.category !== undefined) updates.category = input.category;
  if (input.venue !== undefined) updates.venue = input.venue ?? null;
  if (input.city !== undefined) updates.city = input.city ?? null;
  if (input.province !== undefined) updates.province = input.province ?? null;
  if (input.country !== undefined) updates.country = input.country;
  if (input.eventDate !== undefined) updates.eventDate = new Date(input.eventDate);
  if (input.isPublic !== undefined) updates.isPublic = input.isPublic;

  if (
    input.title !== undefined ||
    input.description !== undefined ||
    input.city !== undefined ||
    input.venue !== undefined ||
    input.province !== undefined
  ) {
    updates.searchKeywords = buildSearchKeywords(
      title,
      description ?? undefined,
      city ?? undefined,
      venue ?? undefined,
      provinceLabel,
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
    publishedAt: FieldValue.serverTimestamp(),
    listingExpiresAt: (() => {
      const expires = new Date();
      expires.setDate(expires.getDate() + businessConfig.eventListingDays);
      return expires;
    })(),
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

  await deleteEventAssets(eventId);
  await ref.delete();
}

export async function getAdminStats() {
  const db = getDbIfConfigured();
  if (!db) {
    return { users: 0, events: 0, photos: 0, pendingRequests: 0, totalLikes: 0 };
  }

  try {
    const [users, events, photos, requests, totalLikes] = await Promise.all([
      db.collection(COLLECTIONS.profiles).count().get(),
      db.collection(COLLECTIONS.events).count().get(),
      db.collection(COLLECTIONS.photos).count().get(),
      db
        .collection(COLLECTIONS.purchaseRequests)
        .where("status", "==", "pending")
        .count()
        .get(),
      getTotalPhotoLikes(),
    ]);

    return {
      users: users.data().count,
      events: events.data().count,
      photos: photos.data().count,
      pendingRequests: requests.data().count,
      totalLikes,
    };
  } catch (error) {
    console.error("[getAdminStats] count queries failed:", error);
    return { users: 0, events: 0, photos: 0, pendingRequests: 0, totalLikes: 0 };
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

  return events.map((event) => {
    const listing = resolveEventListingDates(event);
    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      status: event.status,
      photoCount: event.photoCount,
      eventDate: toDate(event.eventDate),
      photographerId: event.photographerId,
      photographerName: photographerMap.get(event.photographerId) ?? "—",
      publishedAt: listing.publishedAt,
      listingExpiresAt: listing.listingExpiresAt,
    };
  });
}

export interface AdminListingExpiryAlert {
  id: string;
  title: string;
  slug: string;
  photographerName: string;
  photoCount: number;
  listingExpiresAt: Date;
  status: "warning" | "expired";
  daysRemaining: number;
}

export async function getAdminListingExpiryAlerts(): Promise<AdminListingExpiryAlert[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  const snap = await db
    .collection(COLLECTIONS.events)
    .where("status", "==", EventStatus.PUBLISHED)
    .get();

  if (snap.empty) return [];

  const photographerIds = [
    ...new Set(snap.docs.map((doc) => (doc.data() as EventDoc).photographerId)),
  ];
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

  const now = Date.now();

  return snap.docs
    .map((doc) => {
      const data = doc.data() as EventDoc;
      const { listingExpiresAt } = resolveEventListingDates(data);
      if (!listingExpiresAt) return null;

      const daysRemaining = Math.max(
        0,
        Math.ceil((listingExpiresAt.getTime() - now) / (24 * 60 * 60 * 1000)),
      );
      const status =
        listingExpiresAt.getTime() <= now
          ? "expired"
          : daysRemaining <= businessConfig.eventListingWarningDays
            ? "warning"
            : null;

      if (!status) return null;

      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        photographerName: photographerMap.get(data.photographerId) ?? "—",
        photoCount: data.photoCount,
        listingExpiresAt,
        status,
        daysRemaining,
      };
    })
    .filter((item): item is AdminListingExpiryAlert => item !== null)
    .sort((a, b) => a.listingExpiresAt.getTime() - b.listingExpiresAt.getTime());
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

  await deleteEventAssets(eventId);
  await ref.delete();
}

export interface AdminUserListItem extends Profile {
  photographerIsVerified: boolean | null;
}

export async function getAllUsersForAdmin(): Promise<AdminUserListItem[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  const snap = await db
    .collection(COLLECTIONS.profiles)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const profiles = snap.docs.map((doc) => mapProfile(doc.id, doc.data() as ProfileDoc));
  const photographerIds = profiles
    .filter((profile) => profile.role === Role.PHOTOGRAPHER)
    .map((profile) => profile.id);

  const photographerSnaps =
    photographerIds.length > 0
      ? await Promise.all(
          photographerIds.map((id) =>
            db.collection(COLLECTIONS.photographerProfiles).doc(id).get(),
          ),
        )
      : [];

  const verifiedByUserId = new Map(
    photographerIds.map((id, index) => {
      const doc = photographerSnaps[index];
      const isVerified = doc?.exists
        ? Boolean((doc.data() as PhotographerProfileDoc).isVerified)
        : false;
      return [id, isVerified] as const;
    }),
  );

  return profiles.map((profile) => ({
    ...profile,
    photographerIsVerified:
      profile.role === Role.PHOTOGRAPHER
        ? (verifiedByUserId.get(profile.id) ?? false)
        : null,
  }));
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

export interface PublishedEventPickerItem {
  id: string;
  title: string;
  slug: string;
  eventDate: Date;
  photoCount: number;
}

export async function getPublishedEventsForPicker(): Promise<PublishedEventPickerItem[]> {
  const db = getDbIfConfigured();
  if (!db) return [];

  try {
    const snap = await db
      .collection(COLLECTIONS.events)
      .where("status", "==", EventStatus.PUBLISHED)
      .limit(100)
      .get();

    return snap.docs
      .map((doc) => {
        const data = doc.data() as EventDoc;
        if (data.isPublic === false) return null;
        return {
          id: doc.id,
          title: data.title,
          slug: data.slug,
          eventDate: toDate(data.eventDate),
          photoCount: data.photoCount,
        };
      })
      .filter((item): item is PublishedEventPickerItem => item !== null)
      .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
  } catch (error) {
    console.error("[getPublishedEventsForPicker]", error);
    return [];
  }
}

export async function getFeaturedEventsByIds(
  eventIds: string[],
): Promise<EventWithPhotographer[]> {
  if (eventIds.length === 0) return [];

  const db = getDbIfConfigured();
  if (!db) return [];

  try {
    const snaps = await Promise.all(
      eventIds.map((id) => db.collection(COLLECTIONS.events).doc(id).get()),
    );

    const rows = snaps
      .filter((doc) => doc.exists)
      .map((doc) => ({
        id: doc.id,
        data: doc.data() as EventDoc,
      }))
      .filter(
        (row) =>
          row.data.status === EventStatus.PUBLISHED && row.data.isPublic !== false,
      )
      .filter((row) => isEventListingActive(row.data));

    const order = new Map(eventIds.map((id, index) => [id, index]));
    rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

    return Promise.all(
      rows.map(async (row) => {
        const photographer = await getPhotographerSummary(row.data.photographerId);
        return mapEventWithPhotographer(row.id, row.data, photographer);
      }),
    );
  } catch (error) {
    console.error("[getFeaturedEventsByIds]", error);
    return [];
  }
}
