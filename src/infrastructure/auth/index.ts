import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import { authConfig } from "./auth.config";
import { authProviders } from "./auth.providers";
import { getProfileById } from "@/features/profile/infrastructure/profile.repository";
import { isBootstrapAdminEmail, resolveEffectiveRole } from "@/shared/lib/bootstrap-admin";
import type { UserRole } from "@/domain/enums/roles";

async function syncRoleFromProfile(token: JWT): Promise<JWT> {
  const userId = (token.id ?? token.sub) as string | undefined;
  if (!userId?.trim()) return token;

  try {
    const profile = await getProfileById(userId);
    if (!profile) return token;

    token.role = resolveEffectiveRole(
      profile.role as UserRole,
      profile.email ?? (token.email as string | undefined),
    );
  } catch (error) {
    console.error("[auth jwt] profile role sync failed:", error);
    if (isBootstrapAdminEmail(token.email as string | undefined)) {
      token.role = "admin";
    }
  }

  return token;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: authProviders,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const authUser = user as { id?: string; sub?: string; role?: UserRole };
        token.role = authUser.role ?? "client";
        token.id = authUser.id ?? authUser.sub ?? token.sub;
      }

      if (trigger === "update" && session?.role) {
        token.role = session.role as UserRole;
      }

      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      return syncRoleFromProfile(token);
    },
  },
});
