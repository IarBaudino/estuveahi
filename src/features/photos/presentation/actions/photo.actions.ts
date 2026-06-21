"use server";

import { z } from "zod";
import { photographerActionClient } from "@/shared/lib/safe-action";
import { revalidatePublicEventPath } from "@/shared/lib/revalidate-event";
import { toPhotoDTO } from "@/shared/lib/photo-serialization";
import { uploadPhotoSchema, updatePhotoPriceSchema } from "../../application/schemas/photo.schema";
import { deletePhoto, uploadPhoto, updatePhotoPrice } from "../../infrastructure/photo.repository";
import { getEventById } from "@/features/events/infrastructure/event.repository";

async function revalidatePublicGallery(eventId: string) {
  try {
    const event = await getEventById(eventId);
    if (event) {
      revalidatePublicEventPath(event);
    }
  } catch (error) {
    console.error("[photo.actions] revalidate public gallery:", error);
  }
}

export const uploadPhotoAction = photographerActionClient
  .schema(
    uploadPhotoSchema.extend({
      fileBase64: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const { fileBase64, ...input } = parsedInput;
    const buffer = Buffer.from(fileBase64, "base64");
    const photo = await uploadPhoto(ctx.user.id, input, buffer, ctx.user.role);

    await revalidatePublicGallery(input.eventId);

    return { photo: toPhotoDTO(photo) };
  });

export const deletePhotoAction = photographerActionClient
  .schema(z.object({ photoId: z.string().uuid(), eventId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    await deletePhoto(parsedInput.photoId, ctx.user.id, ctx.user.role);
    await revalidatePublicGallery(parsedInput.eventId);
    return { success: true };
  });

export const updatePhotoPriceAction = photographerActionClient
  .schema(updatePhotoPriceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const photo = await updatePhotoPrice(
      parsedInput.photoId,
      parsedInput.eventId,
      ctx.user.id,
      parsedInput.priceCents,
      ctx.user.role,
    );
    await revalidatePublicGallery(parsedInput.eventId);
    return { photo: toPhotoDTO(photo) };
  });
