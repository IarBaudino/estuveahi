import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/domain/enums/roles";

/**
 * Config compatible con Edge (middleware).
 * Sin providers ni Firebase — solo decodifica el JWT de sesión.
 */
export const authConfig = {
  providers: [],
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
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

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = (token.role as UserRole) ?? "client";
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role?: UserRole;
  }

  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
