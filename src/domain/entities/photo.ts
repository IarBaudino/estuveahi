export interface Photo {
  id: string;
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
  capturedAt: Date | null;
  metadata: Record<string, unknown>;
  likeCount: number;
  /** Variantes en storage ya incluyen marca de agua. */
  watermarkBakedIn: boolean;
  createdAt: Date;
}
