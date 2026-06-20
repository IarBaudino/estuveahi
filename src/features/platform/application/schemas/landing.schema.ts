import { z } from "zod";
import { LANDING_IMAGE_KEYS } from "@/config/landing.defaults";

export const landingImageKeySchema = z.enum(LANDING_IMAGE_KEYS);

export const uploadLandingImageSchema = z.object({
  key: landingImageKeySchema,
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  fileBase64: z.string().min(1),
  grayscale: z.boolean(),
});

export type UploadLandingImageInput = z.infer<typeof uploadLandingImageSchema>;

export const updateLandingGrayscaleSchema = z.object({
  key: landingImageKeySchema,
  grayscale: z.boolean(),
});

export const resetLandingImageSchema = z.object({
  key: landingImageKeySchema,
});
