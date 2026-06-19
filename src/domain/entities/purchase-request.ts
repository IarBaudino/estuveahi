import type { PurchaseRequestStatus } from "@/domain/enums/purchase-request-status";

export interface PurchaseRequest {
  id: string;
  clientId: string;
  photoId: string;
  eventId: string;
  photographerId: string;
  status: PurchaseRequestStatus;
  message: string | null;
  quotedPriceCents: number | null;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseRequestWithDetails extends PurchaseRequest {
  photo: {
    id: string;
    thumbnailPath: string;
    previewPath: string;
    originalFilename: string;
  };
  event: {
    id: string;
    title: string;
    slug: string;
  };
  client: {
    id: string;
    fullName: string | null;
    email: string;
  };
}
