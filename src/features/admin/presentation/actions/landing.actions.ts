"use server";

import { revalidatePath } from "next/cache";
import { adminActionClient } from "@/shared/lib/safe-action";
import {
  resetLandingImageSchema,
  uploadLandingImageSchema,
} from "@/features/platform/application/schemas/landing.schema";
import {
  resetLandingImage,
  uploadLandingImage,
} from "@/features/platform/infrastructure/landing-settings.repository";
import { routes } from "@/config/routes";

export const uploadLandingImageAction = adminActionClient
  .schema(uploadLandingImageSchema)
  .action(async ({ parsedInput }) => {
    const buffer = Buffer.from(parsedInput.fileBase64, "base64");
    const url = await uploadLandingImage(parsedInput.key, buffer, parsedInput.mimeType);
    revalidatePath(routes.home);
    revalidatePath(routes.admin.content);
    return { url };
  });

export const resetLandingImageAction = adminActionClient
  .schema(resetLandingImageSchema)
  .action(async ({ parsedInput }) => {
    const images = await resetLandingImage(parsedInput.key);
    revalidatePath(routes.home);
    revalidatePath(routes.admin.content);
    return { images };
  });
