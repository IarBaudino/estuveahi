"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/shared/lib/safe-action";
import { toggleFavorite } from "../../infrastructure/favorite.repository";
import { routes } from "@/config/routes";

export const toggleFavoriteAction = authActionClient
  .schema(z.object({ photoId: z.string().uuid() }))
  .action(async ({ parsedInput, ctx }) => {
    const result = await toggleFavorite(ctx.user.id, parsedInput.photoId);
    revalidatePath(routes.client.favorites);
    return result;
  });
