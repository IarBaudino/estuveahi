import { auth } from "@/infrastructure/auth";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import type { UserRole } from "@/domain/enums/roles";
import { ForbiddenError, UnauthorizedError } from "@/domain/errors/domain-errors";
import { getProfileById, isUserBlocked } from "@/features/profile/infrastructure/profile.repository";

export interface UploadActor {
  userId: string;
  role: UserRole;
}

export async function assertPhotographerUploadAccess(): Promise<UploadActor> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError("Debes iniciar sesión");
  }

  if (await isUserBlocked(session.user.id)) {
    throw new ForbiddenError("Tu cuenta fue suspendida");
  }

  let role = session.user.role;

  try {
    const profile = await getProfileById(session.user.id);
    if (profile) {
      role = profile.role;
    }
  } catch (error) {
    console.error("[upload-auth] profile lookup:", error);
  }

  if (role !== "photographer" && role !== "admin") {
    throw new ForbiddenError(`Acceso solo para ${PHOTOGRAPHER_LABEL.plural}`);
  }

  return { userId: session.user.id, role };
}
