import type { Photo } from "@/domain/entities/photo";
import type { PhotoDoc } from "@/infrastructure/firebase/documents";
import { toDate } from "@/infrastructure/firebase/helpers";

export function mapPhoto(id: string, data: PhotoDoc): Photo {
  return {
    id,
    eventId: data.eventId,
    photographerId: data.photographerId,
    storagePath: data.storagePath,
    thumbnailPath: data.thumbnailPath,
    previewPath: data.previewPath,
    originalFilename: data.originalFilename,
    mimeType: data.mimeType,
    width: data.width,
    height: data.height,
    fileSizeBytes: data.fileSizeBytes,
    priceCents: data.priceCents,
    currency: data.currency,
    isVisible: data.isVisible,
    sortOrder: data.sortOrder,
    capturedAt: data.capturedAt ? toDate(data.capturedAt) : null,
    metadata: data.metadata ?? {},
    createdAt: toDate(data.createdAt),
  };
}
