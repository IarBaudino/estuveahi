import { z } from "zod";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/infrastructure/storage/storage.constants";

export const uploadPhotoSchema = z.object({
  eventId: z.string().uuid(),
  filename: z.string(),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  fileSize: z.number().max(MAX_FILE_SIZE, "Archivo demasiado grande (máx 25MB)"),
  priceCents: z.number().int().min(0).optional(),
});

export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>;

export const updatePhotoPriceSchema = z.object({
  photoId: z.string().uuid(),
  eventId: z.string().uuid(),
  priceCents: z.number().int().min(0).nullable(),
});

export type UpdatePhotoPriceInput = z.infer<typeof updatePhotoPriceSchema>;
