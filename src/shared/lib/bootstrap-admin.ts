import { Role, type UserRole } from "@/domain/enums/roles";

/** Emails que siempre deben tener rol admin (recuperación / dueños de la plataforma). */
function getBootstrapAdminEmails(): Set<string> {
  const raw = process.env.PLATFORM_ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isBootstrapAdminEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  return getBootstrapAdminEmails().has(email.trim().toLowerCase());
}

export function resolveEffectiveRole(
  role: UserRole,
  email: string | null | undefined,
): UserRole {
  if (isBootstrapAdminEmail(email)) return Role.ADMIN;
  return role;
}
