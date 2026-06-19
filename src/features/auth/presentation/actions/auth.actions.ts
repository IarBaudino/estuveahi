"use server";

import { revalidatePath } from "next/cache";
import { signIn, signOut } from "@/infrastructure/auth";
import { actionClient, authActionClient, adminActionClient } from "@/shared/lib/safe-action";
import {
  loginSchema,
  photographerOnboardingSchema,
  registerSchema,
} from "../../application/schemas/auth.schema";
import {
  becomePhotographer,
  registerUser,
  updateUserRole,
  verifyPhotographer,
  unverifyPhotographer,
  updatePhotographerProfile,
} from "../../infrastructure/auth.repository";
import { routes } from "@/config/routes";
import { getProfileByEmail } from "@/features/profile/infrastructure/profile.repository";
import type { UserRole } from "@/domain/enums/roles";
import { z } from "zod";
import { AuthError } from "next-auth";

export const registerAction = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput }) => {
    await registerUser(parsedInput);
    return { success: true };
  });

export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    try {
      await signIn("credentials", {
        email: parsedInput.email,
        password: parsedInput.password,
        redirect: false,
      });
      const profile = await getProfileByEmail(parsedInput.email);
      return {
        success: true,
        role: (profile?.role ?? "client") as UserRole,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw new Error("Credenciales inválidas");
      }
      throw error;
    }
  });

export const logoutAction = actionClient.action(async () => {
  await signOut({ redirectTo: routes.home });
});

export const becomePhotographerAction = authActionClient
  .schema(photographerOnboardingSchema)
  .action(async ({ parsedInput, ctx }) => {
    await becomePhotographer(ctx.user.id, parsedInput);
    revalidatePath(routes.photographer.dashboard);
    return { success: true };
  });

export const updateUserRoleAction = adminActionClient
  .schema(
    z.object({
      userId: z.string().uuid(),
      role: z.enum(["client", "photographer", "admin"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    await updateUserRole(parsedInput.userId, parsedInput.role);
    revalidatePath(routes.admin.users);
    return { success: true };
  });

export const verifyPhotographerAction = adminActionClient
  .schema(z.object({ userId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    await verifyPhotographer(parsedInput.userId);
    revalidatePath(routes.admin.users);
    return { success: true };
  });

export const unverifyPhotographerAction = adminActionClient
  .schema(z.object({ userId: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    await unverifyPhotographer(parsedInput.userId);
    revalidatePath(routes.admin.users);
    return { success: true };
  });

export const updatePhotographerProfileAction = authActionClient
  .schema(photographerOnboardingSchema)
  .action(async ({ parsedInput, ctx }) => {
    await updatePhotographerProfile(ctx.user.id, parsedInput);
    revalidatePath(routes.photographer.profile);
    return { success: true };
  });
