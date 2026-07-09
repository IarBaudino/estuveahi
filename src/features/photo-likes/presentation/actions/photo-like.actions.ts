"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/shared/lib/safe-action";
import { togglePhotoLike } from "../../infrastructure/photo-like.repository";
import { routes } from "@/config/routes";
import { getDbIfConfigured } from "@/infrastructure/firebase/admin";
import { COLLECTIONS } from "@/infrastructure/firebase/collections";
import type { EventDoc } from "@/infrastructure/firebase/documents";

export const togglePhotoLikeAction = authActionClient
  .schema(z.object({ photoId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const result = await togglePhotoLike(ctx.user.id, parsedInput.photoId);

    revalidatePath(routes.home);

    const db = getDbIfConfigured();
    if (db) {
      const eventDoc = await db.collection(COLLECTIONS.events).doc(result.eventId).get();
      if (eventDoc.exists) {
        const slug = (eventDoc.data() as EventDoc).slug;
        revalidatePath(routes.event(slug));
      }
    }

    return result;
  });
