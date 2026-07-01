import { auth } from "@/infrastructure/auth";
import { getProfileById } from "@/features/profile/infrastructure/profile.repository";
import { repairBootstrapAdminRole } from "@/features/auth/infrastructure/auth.repository";
import { isBootstrapAdminEmail, resolveEffectiveRole } from "@/shared/lib/bootstrap-admin";
import type { UserRole } from "@/domain/enums/roles";
import { Role } from "@/domain/enums/roles";

export type AppSessionUser = {
  id: string;
  role: UserRole;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

export async function getServerSessionUser(): Promise<AppSessionUser | null> {
  try {
    const session = await auth();
    if (!session?.user) return null;

    const id = session.user.id?.trim();
    if (!id) {
      console.error("[getServerSessionUser] session without user id");
      return null;
    }

    let role = session.user.role;
    let email = session.user.email;

    try {
      const profile = await getProfileById(id);
      if (profile) {
        role = profile.role;
        email = profile.email ?? email;

        if (profile.role !== Role.ADMIN && isBootstrapAdminEmail(profile.email)) {
          try {
            const repaired = await repairBootstrapAdminRole(id, profile.email);
            if (repaired) role = Role.ADMIN;
          } catch (error) {
            console.error("[getServerSessionUser] bootstrap admin repair failed:", error);
          }
        }
      }
    } catch (error) {
      console.error("[getServerSessionUser] profile lookup failed:", error);
    }

    role = resolveEffectiveRole(role, email);

    return {
      id,
      role,
      email,
      name: session.user.name,
      image: session.user.image,
    };
  } catch (error) {
    console.error("[getServerSessionUser] auth failed:", error);
    return null;
  }
}
