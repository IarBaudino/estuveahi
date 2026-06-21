import type { Timestamp } from "firebase-admin/firestore";
import type { EventCategory } from "@/domain/enums/event-category";
import type { EventStatus } from "@/domain/enums/event-status";
import type { PurchaseRequestStatus } from "@/domain/enums/purchase-request-status";
import type { UserRole } from "@/domain/enums/roles";
import type { PhotographerApplicationStatus } from "@/domain/enums/photographer-application-status";

/** Documentos Firestore — campos en camelCase */
export interface ProfileDoc {
  email: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  phone: string | null;
  isBlocked: boolean;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface PhotographerProfileDoc {
  displayName: string;
  bio: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  portfolioUrl: string | null;
  isVerified: boolean;
  applicationStatus?: PhotographerApplicationStatus;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface EventDoc {
  photographerId: string;
  title: string;
  slug: string;
  description: string | null;
  category: EventCategory;
  venue: string | null;
  city: string | null;
  country: string;
  eventDate: Timestamp | Date;
  status: EventStatus;
  coverPhotoId: string | null;
  qrCode: string;
  isPublic: boolean;
  photoCount: number;
  searchKeywords: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface PhotoDoc {
  eventId: string;
  photographerId: string;
  storagePath: string;
  thumbnailPath: string;
  previewPath: string;
  originalFilename: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  fileSizeBytes: number;
  priceCents: number | null;
  currency: string;
  isVisible: boolean;
  sortOrder: number;
  capturedAt: Timestamp | Date | null;
  metadata: Record<string, unknown>;
  createdAt: Timestamp | Date;
}

export interface FavoriteDoc {
  userId: string;
  photoId: string;
  createdAt: Timestamp | Date;
}

export interface PurchaseRequestDoc {
  clientId: string;
  photoId: string;
  eventId: string;
  photographerId: string;
  status: PurchaseRequestStatus;
  message: string | null;
  quotedPriceCents: number | null;
  currency: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface LandingSettingsDoc {
  images: Record<string, string>;
  grayscale?: Record<string, boolean>;
  featuredCategories?: LandingFeaturedCategoryDoc[];
  featuredEventIds?: string[];
  updatedAt: Timestamp | Date;
}

export interface LandingFeaturedCategoryDoc {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  imageKey?: string | null;
  eventCategory?: string | null;
  href?: string | null;
  layout: "wide" | "narrow";
  grayscale: boolean;
  sortOrder: number;
}
