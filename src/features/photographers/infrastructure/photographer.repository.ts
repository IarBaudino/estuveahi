import { getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { EventDoc, PhotographerProfileDoc, ProfileDoc } from "@/infrastructure/firebase/documents";
import { mapEvent } from "@/infrastructure/mappers/event.mapper";
import type { PublicPhotographer } from "@/domain/entities/public-photographer";
import type { Event } from "@/domain/entities/event";
import { EventStatus } from "@/domain/enums/event-status";
import { PhotographerApplicationStatus } from "@/domain/enums/photographer-application-status";
import { Role } from "@/domain/enums/roles";
import { hasAvatar } from "@/shared/lib/avatar-url";

function isPublicListing(data: EventDoc): boolean {
  return data.isPublic !== false;
}

function isListedPhotographer(data: PhotographerProfileDoc): boolean {
  if (data.applicationStatus === PhotographerApplicationStatus.PENDING) return false;
  if (data.applicationStatus === PhotographerApplicationStatus.REJECTED) return false;
  return true;
}

function mapPublicPhotographer(
  id: string,
  data: PhotographerProfileDoc,
  publishedEventCount: number,
  profileAvatarUrl: string | null | undefined,
): PublicPhotographer {
  return {
    id,
    displayName: data.displayName,
    bio: data.bio,
    websiteUrl: data.websiteUrl,
    instagramHandle: data.instagramHandle,
    isVerified: data.isVerified,
    publishedEventCount,
    hasAvatar: hasAvatar(profileAvatarUrl),
  };
}

async function countPublishedEventsByPhotographer(): Promise<Map<string, number>> {
  const db = getDbIfConfigured();
  const counts = new Map<string, number>();
  if (!db) return counts;

  const snap = await db
    .collection(COLLECTIONS.events)
    .where("status", "==", EventStatus.PUBLISHED)
    .limit(500)
    .get();

  for (const doc of snap.docs) {
    const data = doc.data() as EventDoc;
    if (!isPublicListing(data)) continue;
    counts.set(data.photographerId, (counts.get(data.photographerId) ?? 0) + 1);
  }

  return counts;
}

export async function searchPublicPhotographers(input: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ photographers: PublicPhotographer[]; total: number }> {
  try {
    const db = getDbIfConfigured();
    if (!db) return { photographers: [], total: 0 };

    const page = input.page ?? 1;
    const limit = input.limit ?? 24;

    const [profileSnap, eventCounts] = await Promise.all([
      db.collection(COLLECTIONS.profiles).where("role", "==", Role.PHOTOGRAPHER).limit(200).get(),
      countPublishedEventsByPhotographer(),
    ]);

    const profileById = new Map(
      profileSnap.docs.map((doc) => [doc.id, doc.data() as ProfileDoc]),
    );

    const photographerIds = profileSnap.docs
      .filter((doc) => !profileById.get(doc.id)?.isBlocked)
      .map((doc) => doc.id);

    const photographerSnaps = await Promise.all(
      photographerIds.map((id) =>
        db.collection(COLLECTIONS.photographerProfiles).doc(id).get(),
      ),
    );

    let rows = photographerSnaps
      .filter((doc) => doc.exists)
      .map((doc) => ({
        id: doc.id,
        data: doc.data() as PhotographerProfileDoc,
      }))
      .filter((row) => isListedPhotographer(row.data));

    if (input.q?.trim()) {
      const q = input.q.trim().toLowerCase();
      rows = rows.filter((row) => {
        const haystack = [
          row.data.displayName,
          row.data.bio,
          row.data.instagramHandle,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    rows.sort((a, b) => a.data.displayName.localeCompare(b.data.displayName, "es"));

    const total = rows.length;
    const offset = (page - 1) * limit;
    const pageRows = rows.slice(offset, offset + limit);

    const photographers = pageRows.map((row) => {
      const profile = profileById.get(row.id);

      return mapPublicPhotographer(
        row.id,
        row.data,
        eventCounts.get(row.id) ?? 0,
        profile?.avatarUrl,
      );
    });

    return { photographers, total };
  } catch (error) {
    console.error("[searchPublicPhotographers]", error);
    return { photographers: [], total: 0 };
  }
}

export async function getPublicPhotographerById(
  id: string,
): Promise<PublicPhotographer | null> {
  try {
    const db = getDbIfConfigured();
    if (!db) return null;

    const [profileDoc, photographerDoc] = await Promise.all([
      db.collection(COLLECTIONS.profiles).doc(id).get(),
      db.collection(COLLECTIONS.photographerProfiles).doc(id).get(),
    ]);

    if (!profileDoc.exists || !photographerDoc.exists) return null;

    const profileData = profileDoc.data() as ProfileDoc;
    if (profileData.role !== Role.PHOTOGRAPHER || profileData.isBlocked) return null;

    const data = photographerDoc.data() as PhotographerProfileDoc;
    if (!isListedPhotographer(data)) return null;

    const events = await getPublicEventsByPhotographer(id);

    return mapPublicPhotographer(
      id,
      data,
      events.length,
      profileData.avatarUrl,
    );
  } catch (error) {
    console.error("[getPublicPhotographerById]", error);
    return null;
  }
}

export async function getPublicEventsByPhotographer(photographerId: string): Promise<Event[]> {
  try {
    const db = getDbIfConfigured();
    if (!db) return [];

    const snap = await db
      .collection(COLLECTIONS.events)
      .where("photographerId", "==", photographerId)
      .where("status", "==", EventStatus.PUBLISHED)
      .limit(100)
      .get();

    return snap.docs
      .map((doc) => mapEvent(doc.id, doc.data() as EventDoc))
      .filter((event) => event.isPublic !== false)
      .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
  } catch (error) {
    console.error("[getPublicEventsByPhotographer]", error);
    return [];
  }
}
