import { auth } from "@/infrastructure/auth";
import { getProfileById } from "@/features/profile/infrastructure/profile.repository";
import type { UserRole } from "@/domain/enums/roles";

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

    try {
      const profile = await getProfileById(id);
      if (profile) {
        role = profile.role;
      }
    } catch (error) {
      console.error("[getServerSessionUser] profile lookup failed:", error);
    }

    return {
      id,
      role,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    };
  } catch (error) {
    console.error("[getServerSessionUser] auth failed:", error);
    return null;
  }
}
