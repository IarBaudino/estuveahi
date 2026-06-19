import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { isFirebaseConfigured } from "@/infrastructure/firebase/config";
import { signInWithEmailPassword } from "@/infrastructure/firebase/auth-rest";
import { getProfileById } from "@/features/profile/infrastructure/profile.repository";
import type { UserRole } from "@/domain/enums/roles";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/** Providers con Firebase — solo para rutas Node (no middleware). */
export const authProviders: NonNullable<NextAuthConfig["providers"]> = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;
      if (!isFirebaseConfigured()) return null;

      try {
        const authResult = await signInWithEmailPassword(
          parsed.data.email,
          parsed.data.password,
        );

        const profile = await getProfileById(authResult.localId);
        if (!profile || profile.isBlocked) return null;

        const displayName =
          [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
          profile.fullName;

        return {
          id: profile.id,
          email: profile.email,
          name: displayName,
          image: profile.avatarUrl,
          role: profile.role as UserRole,
        };
      } catch {
        return null;
      }
    },
  }),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : []),
];
