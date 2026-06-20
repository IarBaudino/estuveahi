"use server";

import { revalidatePath } from "next/cache";
import { adminActionClient } from "@/shared/lib/safe-action";
import {
  resetLandingImageSchema,
  updateLandingGrayscaleSchema,
  uploadLandingImageSchema,
} from "@/features/platform/application/schemas/landing.schema";
import {
  resetLandingImage,
  setLandingImageGrayscale,
  uploadLandingImage,
} from "@/features/platform/infrastructure/landing-settings.repository";
import { routes } from "@/config/routes";

export const uploadLandingImageAction = adminActionClient
  .schema(uploadLandingImageSchema)
  .action(async ({ parsedInput }) => {
    const { fileBase64, key, mimeType, grayscale } = parsedInput;
    const buffer = Buffer.from(fileBase64, "base64");
    const url = await uploadLandingImage(key, buffer, mimeType, grayscale);
    revalidatePath(routes.home);
    revalidatePath(routes.admin.content);
    return { url };
  });

export const updateLandingGrayscaleAction = adminActionClient
  .schema(updateLandingGrayscaleSchema)
  .action(async ({ parsedInput }) => {
    const grayscale = await setLandingImageGrayscale(parsedInput.key, parsedInput.grayscale);
    revalidatePath(routes.home);
    revalidatePath(routes.admin.content);
    return { grayscale };
  });

export const resetLandingImageAction = adminActionClient
  .schema(resetLandingImageSchema)
  .action(async ({ parsedInput }) => {
    const settings = await resetLandingImage(parsedInput.key);
    revalidatePath(routes.home);
    revalidatePath(routes.admin.content);
    return { settings };
  });
