"use server";

import { revalidatePath } from "next/cache";
import {
  authActionClient,
  adminActionClient,
} from "@/shared/lib/safe-action";
import {
  updateProfileSchema,
  uploadAvatarSchema,
} from "../../application/schemas/profile.schema";
import {
  assertUserNotBlocked,
  getProfileById,
  setUserBlocked,
  updateProfile,
  uploadAvatar,
} from "../../infrastructure/profile.repository";
import { deleteUserCompletely } from "../../infrastructure/user-cleanup";
import { routes } from "@/config/routes";
import { z } from "zod";
import { firebaseUserIdSchema } from "@/shared/schemas/firebase.schema";
import { DomainError } from "@/domain/errors/domain-errors";
import { toastMessages } from "@/shared/lib/toast-messages";

export const updateProfileAction = authActionClient
  .schema(updateProfileSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertUserNotBlocked(ctx.user.id);
    const profile = await updateProfile(ctx.user.id, parsedInput);
    revalidatePath(routes.client.profile);
    return { profile };
  });

export const uploadAvatarAction = authActionClient
  .schema(uploadAvatarSchema)
  .action(async ({ parsedInput, ctx }) => {
    await assertUserNotBlocked(ctx.user.id);
    const buffer = Buffer.from(parsedInput.fileBase64, "base64");
    const avatarUrl = await uploadAvatar(
      ctx.user.id,
      buffer,
      parsedInput.mimeType,
    );
    revalidatePath(routes.client.profile);
    return { avatarUrl };
  });

export const getMyProfileAction = authActionClient.action(async ({ ctx }) => {
  const profile = await getProfileById(ctx.user.id);
  return { profile };
});

export const setUserBlockedAction = adminActionClient
  .schema(
    z.object({
      userId: firebaseUserIdSchema,
      blocked: z.boolean(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.userId === ctx.user.id) {
      throw new DomainError("No podés bloquear tu propia cuenta", "VALIDATION");
    }
    await setUserBlocked(parsedInput.userId, parsedInput.blocked);
    revalidatePath(routes.admin.users);
    return { success: true };
  });

export const deleteUserAction = adminActionClient
  .schema(z.object({ userId: firebaseUserIdSchema }))
  .action(async ({ parsedInput, ctx }) => {
    await deleteUserCompletely(parsedInput.userId, ctx.user.id);
    revalidatePath(routes.admin.users);
    revalidatePath(routes.admin.events);
    revalidatePath(routes.admin.photographers);
    revalidatePath(routes.admin.requests);
    revalidatePath(routes.photographers);
    return { success: true as const, message: toastMessages.deleted };
  });
