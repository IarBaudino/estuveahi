import type { Photo } from "@/domain/entities/photo";

/** Foto serializable para server actions y props cliente. */
export type PhotoDTO = Omit<Photo, "capturedAt" | "createdAt"> & {
  capturedAt: string | null;
  createdAt: string;
};

export function toPhotoDTO(photo: Photo): PhotoDTO {
  const createdAt =
    photo.createdAt instanceof Date && !Number.isNaN(photo.createdAt.getTime())
      ? photo.createdAt
      : new Date();

  return {
    ...photo,
    capturedAt: photo.capturedAt?.toISOString() ?? null,
    createdAt: createdAt.toISOString(),
  };
}

export function fromPhotoDTO(dto: PhotoDTO): Photo {
  return {
    ...dto,
    capturedAt: dto.capturedAt ? new Date(dto.capturedAt) : null,
    createdAt: new Date(dto.createdAt),
  };
}
