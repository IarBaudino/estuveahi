"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { photographerActionClient } from "@/shared/lib/safe-action";
import { uploadPhotoSchema, updatePhotoPriceSchema } from "../../application/schemas/photo.schema";
import { deletePhoto, uploadPhoto, updatePhotoPrice } from "../../infrastructure/photo.repository";
import { getEventById } from "@/features/events/infrastructure/event.repository";
import { routes } from "@/config/routes";

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

    const event = await getEventById(input.eventId);
    if (event) {
      revalidatePath(routes.event(event.slug));
      revalidatePath(routes.photographer.event(event.id));
      revalidatePath(routes.admin.event(event.id));
    }

    return { photo };
  });

export const deletePhotoAction = photographerActionClient
  .schema(z.object({ photoId: z.string().uuid(), eventId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    await deletePhoto(parsedInput.photoId, ctx.user.id, ctx.user.role);
    const event = await getEventById(parsedInput.eventId);
    if (event) {
      revalidatePath(routes.event(event.slug));
      revalidatePath(routes.photographer.event(event.id));
      revalidatePath(routes.admin.event(event.id));
    }
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
    const event = await getEventById(parsedInput.eventId);
    if (event) {
      revalidatePath(routes.event(event.slug));
      revalidatePath(routes.photographer.event(event.id));
      revalidatePath(routes.admin.event(event.id));
    }
    return { photo };
  });
