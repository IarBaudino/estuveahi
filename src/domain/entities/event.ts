import type { ArgentinaProvince } from "@/domain/enums/argentina-province";
import type { EventCategory } from "@/domain/enums/event-category";
import type { EventStatus } from "@/domain/enums/event-status";

export interface Event {
  id: string;
  photographerId: string;
  title: string;
  slug: string;
  description: string | null;
  category: EventCategory;
  venue: string | null;
  city: string | null;
  province: ArgentinaProvince | null;
  country: string;
  eventDate: Date;
  status: EventStatus;
  coverPhotoId: string | null;
  qrCode: string;
  isPublic: boolean;
  photoCount: number;
  publishedAt: Date | null;
  listingExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventWithPhotographer extends Event {
  photographer: {
    id: string;
    displayName: string;
    isVerified: boolean;
  };
}
