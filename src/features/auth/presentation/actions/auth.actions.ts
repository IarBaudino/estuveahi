"use server";

import { revalidatePath } from "next/cache";
import { signIn, signOut } from "@/infrastructure/auth";
import { actionClient, authActionClient, adminActionClient } from "@/shared/lib/safe-action";
import {
  loginSchema,
  forgotPasswordSchema,
  changePasswordSchema,
  photographerOnboardingSchema,
  photographerProfileUpdateSchema,
  registerSchema,
} from "../../application/schemas/auth.schema";
import {
  changePassword,
  sendPasswordResetEmail,
} from "@/infrastructure/firebase/auth-rest";
import {
  submitPhotographerApplication,
  approvePhotographerApplication,
  rejectPhotographerApplication,
  registerUser,
  getPhotographerApplicationStatus,
  updateUserRole,
  verifyPhotographer,
  unverifyPhotographer,
  updatePhotographerProfile,
} from "../../infrastructure/auth.repository";
import { routes } from "@/config/routes";
import { getProfileByEmail } from "@/features/profile/infrastructure/profile.repository";
import type { UserRole } from "@/domain/enums/roles";
import { Role } from "@/domain/enums/roles";
import { PhotographerApplicationStatus } from "@/domain/enums/photographer-application-status";
import { z } from "zod";
import { AuthError } from "next-auth";
import { firebaseUserIdSchema } from "@/shared/schemas/firebase.schema";

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

export const requestPasswordResetAction = actionClient
  .schema(forgotPasswordSchema)
  .action(async ({ parsedInput }) => {
    await sendPasswordResetEmail(parsedInput.email);
    return { success: true as const };
  });

export const changePasswordAction = authActionClient
  .schema(changePasswordSchema)
  .action(async ({ parsedInput, ctx }) => {
    const profile = await getProfileByEmail(ctx.user.email ?? "");
    const email = profile?.email ?? ctx.user.email;
    if (!email) {
      throw new Error("No encontramos el email de tu cuenta");
    }

    await changePassword(email, parsedInput.currentPassword, parsedInput.newPassword);
    await signOut({ redirect: false });
    return { success: true as const, signedOut: true as const };
  });

export const logoutAction = actionClient.action(async () => {
  await signOut({ redirectTo: routes.home });
});

export const becomePhotographerAction = authActionClient
  .schema(photographerOnboardingSchema)
  .action(async ({ parsedInput, ctx }) => {
    const status = await getPhotographerApplicationStatus(ctx.user.id);
    if (status === PhotographerApplicationStatus.PENDING) {
      throw new Error("Tu solicitud ya está en revisión");
    }
    if (status === PhotographerApplicationStatus.APPROVED) {
      throw new Error("Tu solicitud ya fue aprobada. Volvé a iniciar sesión.");
    }
    if (ctx.user.role === Role.PHOTOGRAPHER || ctx.user.role === Role.ADMIN) {
      throw new Error("Ya tenés acceso de fotógrafo");
    }

    await submitPhotographerApplication(ctx.user.id, parsedInput);
    revalidatePath(routes.becomePhotographer);
    revalidatePath(routes.admin.photographers);
    return { success: true, status: "pending" as const };
  });

export const approvePhotographerApplicationAction = adminActionClient
  .schema(z.object({ userId: firebaseUserIdSchema }))
  .action(async ({ parsedInput }) => {
    await approvePhotographerApplication(parsedInput.userId);
    revalidatePath(routes.admin.photographers);
    revalidatePath(routes.admin.users);
    return { success: true };
  });

export const rejectPhotographerApplicationAction = adminActionClient
  .schema(z.object({ userId: firebaseUserIdSchema }))
  .action(async ({ parsedInput }) => {
    await rejectPhotographerApplication(parsedInput.userId);
    revalidatePath(routes.admin.photographers);
    return { success: true };
  });

export const updateUserRoleAction = adminActionClient
  .schema(
    z.object({
      userId: firebaseUserIdSchema,
      role: z.enum(["client", "photographer", "admin"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    await updateUserRole(parsedInput.userId, parsedInput.role);
    revalidatePath(routes.admin.users);
    revalidatePath(routes.admin.photographers);
    return { success: true };
  });

export const verifyPhotographerAction = adminActionClient
  .schema(z.object({ userId: firebaseUserIdSchema }))
  .action(async ({ parsedInput }) => {
    await verifyPhotographer(parsedInput.userId);
    revalidatePath(routes.admin.users);
    return { success: true };
  });

export const unverifyPhotographerAction = adminActionClient
  .schema(z.object({ userId: firebaseUserIdSchema }))
  .action(async ({ parsedInput }) => {
    await unverifyPhotographer(parsedInput.userId);
    revalidatePath(routes.admin.users);
    return { success: true };
  });

export const updatePhotographerProfileAction = authActionClient
  .schema(photographerProfileUpdateSchema)
  .action(async ({ parsedInput, ctx }) => {
    await updatePhotographerProfile(ctx.user.id, parsedInput);
    revalidatePath(routes.photographer.profile);
    return { success: true };
  });
