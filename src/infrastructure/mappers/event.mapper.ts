import type { Event, EventWithPhotographer } from "@/domain/entities/event";
import type { EventDoc, PhotographerProfileDoc } from "@/infrastructure/firebase/documents";
import { toDate } from "@/infrastructure/firebase/helpers";

export function mapEvent(id: string, data: EventDoc): Event {
  return {
    id,
    photographerId: data.photographerId,
    title: data.title,
    slug: data.slug,
    description: data.description,
    category: data.category,
    venue: data.venue,
    city: data.city,
    country: data.country,
    eventDate: toDate(data.eventDate),
    status: data.status,
    coverPhotoId: data.coverPhotoId,
    qrCode: data.qrCode,
    isPublic: data.isPublic,
    photoCount: data.photoCount,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function mapEventWithPhotographer(
  id: string,
  data: EventDoc,
  photographer: { id: string; displayName: string; isVerified: boolean },
): EventWithPhotographer {
  return {
    ...mapEvent(id, data),
    photographer,
  };
}

export function mapPhotographerSummary(
  id: string,
  data: PhotographerProfileDoc,
) {
  return {
    id,
    displayName: data.displayName,
    isVerified: data.isVerified,
  };
}
