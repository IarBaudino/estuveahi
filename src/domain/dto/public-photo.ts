import type { Photo } from "@/domain/entities/photo";

/** Foto expuesta al cliente — sin rutas de almacenamiento ni originales. */
export interface PublicPhoto {
  id: string;
  eventId: string;
  photographerId: string;
  originalFilename: string;
  width: number | null;
  height: number | null;
  priceCents: number | null;
  currency: string;
  isVisible: boolean;
  sortOrder: number;
  capturedAt: Date | null;
  createdAt: Date;
  likeCount: number;
}

export function toPublicPhoto(photo: Photo): PublicPhoto {
  return {
    id: photo.id,
    eventId: photo.eventId,
    photographerId: photo.photographerId,
    originalFilename: photo.originalFilename,
    width: photo.width,
    height: photo.height,
    priceCents: photo.priceCents,
    currency: photo.currency,
    isVisible: photo.isVisible,
    sortOrder: photo.sortOrder,
    capturedAt: photo.capturedAt,
    createdAt: photo.createdAt,
    likeCount: photo.likeCount,
  };
}

export function toPublicPhotos(photos: Photo[]): PublicPhoto[] {
  return photos.map(toPublicPhoto);
}
