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
  coverageProvinces?: string[];
  availableForHire?: boolean;
  /** false = oculto del directorio público; default true si falta. */
  isPublicProfile?: boolean;
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
  province?: string | null;
  country: string;
  eventDate: Timestamp | Date;
  status: EventStatus;
  coverPhotoId: string | null;
  qrCode: string;
  isPublic: boolean;
  photoCount: number;
  searchKeywords: string[];
  publishedAt?: Timestamp | Date | null;
  listingExpiresAt?: Timestamp | Date | null;
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
  likeCount?: number;
  /** true = preview/thumbnail en Storage ya tienen marca de agua. */
  watermarkBakedIn?: boolean;
  createdAt: Timestamp | Date;
}

export interface PhotoLikeDoc {
  userId: string;
  photoId: string;
  eventId: string;
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
  photographerArchivedAt?: Timestamp | Date | null;
  clientArchivedAt?: Timestamp | Date | null;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface LandingSettingsDoc {
  images: Record<string, string>;
  grayscale?: Record<string, boolean>;
  heroFocus?: { x?: number; y?: number } | null;
  copy?: Partial<{
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroSubtitle: string;
    heroCtaPrimary: string;
    heroCtaSecondary: string;
    photographerEyebrow: string;
    photographerTitle: string;
    photographerBody: string;
    photographerCta: string;
    finalCtaTitleLine1: string;
    finalCtaTitleLine2: string;
    finalCtaButton: string;
  }> | null;
  featuredCategories?: LandingFeaturedCategoryDoc[];
  featuredEventIds?: string[];
  testimonials?: LandingTestimonialDoc[];
  faq?: LandingFaqItemDoc[];
  updatedAt: Timestamp | Date;
}

export interface LandingTestimonialDoc {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  sortOrder: number;
}

export interface LandingFaqItemDoc {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
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
