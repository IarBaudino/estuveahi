import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { auth } from "@/infrastructure/auth";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { DomainError } from "@/domain/errors/domain-errors";
import { isUserBlocked, getProfileById } from "@/features/profile/infrastructure/profile.repository";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof DomainError) return e.message;
    console.error("[safe-action]", e);
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new DomainError("Debes iniciar sesión", "UNAUTHORIZED");
  }
  if (await isUserBlocked(session.user.id)) {
    throw new DomainError("Tu cuenta fue suspendida", "FORBIDDEN");
  }
  return next({ ctx: { user: session.user } });
});

export const photographerActionClient = authActionClient.use(
  async ({ next, ctx }) => {
    let role = ctx.user.role;

    try {
      const profile = await getProfileById(ctx.user.id);
      if (profile) {
        role = profile.role;
      }
    } catch (error) {
      console.error("[photographerActionClient] profile lookup:", error);
    }

    if (role !== "photographer" && role !== "admin") {
      throw new DomainError(`Acceso solo para ${PHOTOGRAPHER_LABEL.plural}`, "FORBIDDEN");
    }

    return next({ ctx: { user: { ...ctx.user, role } } });
  },
);

export const adminActionClient = authActionClient.use(async ({ next, ctx }) => {
  if (ctx.user.role !== "admin") {
    throw new DomainError("Acceso solo para administradores", "FORBIDDEN");
  }
  return next({ ctx });
});
