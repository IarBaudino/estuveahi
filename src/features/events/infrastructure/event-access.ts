import type { UserRole } from "@/domain/enums/roles";
import { Role } from "@/domain/enums/roles";

export function canManageEvent(
  event: { photographerId: string },
  userId: string,
  role?: UserRole,
): boolean {
  return event.photographerId === userId || role === Role.ADMIN;
}

export function canManagePhoto(
  photo: { photographerId: string },
  userId: string,
  role?: UserRole,
): boolean {
  return photo.photographerId === userId || role === Role.ADMIN;
}
