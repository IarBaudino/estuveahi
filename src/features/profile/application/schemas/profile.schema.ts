import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  phone: z
    .string()
    .min(8, "Teléfono requerido")
    .max(20, "Teléfono demasiado largo"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const uploadAvatarSchema = z.object({
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  fileBase64: z.string().min(1),
});

export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>;
