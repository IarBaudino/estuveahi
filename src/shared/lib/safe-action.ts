import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { auth } from "@/infrastructure/auth";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { DomainError } from "@/domain/errors/domain-errors";
import { isUserBlocked } from "@/features/profile/infrastructure/profile.repository";

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof DomainError) return e.message;
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
    if (ctx.user.role !== "photographer" && ctx.user.role !== "admin") {
      throw new DomainError(`Acceso solo para ${PHOTOGRAPHER_LABEL.plural}`, "FORBIDDEN");
    }
    return next({ ctx });
  },
);

export const adminActionClient = authActionClient.use(async ({ next, ctx }) => {
  if (ctx.user.role !== "admin") {
    throw new DomainError("Acceso solo para administradores", "FORBIDDEN");
  }
  return next({ ctx });
});
