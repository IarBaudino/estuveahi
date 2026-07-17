"use server";

import { z } from "zod";
import { actionClient, photographerActionClient } from "@/shared/lib/safe-action";
import { revalidatePublicEventPath } from "@/shared/lib/revalidate-event";
import { toPhotoDTO } from "@/shared/lib/photo-serialization";
import { uploadPhotoSchema, updatePhotoPriceSchema, bulkUpdatePhotoPricesSchema } from "../../application/schemas/photo.schema";
import { deletePhoto, uploadPhoto, updatePhotoPrice } from "../../infrastructure/photo.repository";
import { getEventById } from "@/features/events/infrastructure/event.repository";
import { getEventPhotos } from "../../infrastructure/photo-read.repository";
import { PUBLIC_GALLERY_INITIAL_PHOTOS } from "../../application/gallery.constants";
import { toPublicPhotos } from "@/domain/dto/public-photo";
import { EventStatus } from "@/domain/enums/event-status";
import { isListingCurrentlyActive } from "@/shared/lib/event-listing";

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

export const bulkUpdatePhotoPricesAction = photographerActionClient
  .schema(bulkUpdatePhotoPricesSchema)
  .action(async ({ parsedInput, ctx }) => {
    const photos = await Promise.all(
      parsedInput.prices.map((item) =>
        updatePhotoPrice(
          item.photoId,
          parsedInput.eventId,
          ctx.user.id,
          item.priceCents,
          ctx.user.role,
        ),
      ),
    );
    await revalidatePublicGallery(parsedInput.eventId);
    return { photos: photos.map(toPhotoDTO) };
  });

export const loadMorePublicEventPhotosAction = actionClient
  .schema(
    z.object({
      eventId: z.string().min(1),
      offset: z.number().int().min(0),
      limit: z.number().int().min(1).max(100).optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const event = await getEventById(parsedInput.eventId);
    if (
      !event ||
      event.status !== EventStatus.PUBLISHED ||
      event.isPublic === false ||
      !isListingCurrentlyActive(event.listingExpiresAt)
    ) {
      return { photos: [] as ReturnType<typeof toPublicPhotos> };
    }

    const photos = await getEventPhotos(
      parsedInput.eventId,
      parsedInput.limit ?? PUBLIC_GALLERY_INITIAL_PHOTOS,
      parsedInput.offset,
    );

    return { photos: toPublicPhotos(photos) };
  });
