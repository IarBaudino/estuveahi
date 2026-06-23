import type { UserRole } from "@/domain/enums/roles";
import { Role } from "@/domain/enums/roles";
import { EventStatus } from "@/domain/enums/event-status";

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

/** Puede subir fotos al evento (dueño en borrador/publicado; colaboradores solo si está publicado). */
export function canContributeToEvent(
  event: { photographerId: string; status: string },
  userId: string,
  role?: UserRole,
): boolean {
  if (role === Role.ADMIN) return event.status !== EventStatus.ARCHIVED;
  if (event.status === EventStatus.ARCHIVED) return false;
  if (canManageEvent(event, userId, role)) return true;
  if (role !== Role.PHOTOGRAPHER) return false;
  return event.status === EventStatus.PUBLISHED;
}

/** Puede abrir la pantalla de gestión del evento en el panel de fotógrafo. */
export function canViewEventPanel(
  event: { photographerId: string; status: string },
  userId: string,
  role?: UserRole,
): boolean {
  if (canManageEvent(event, userId, role)) return true;
  if (role !== Role.PHOTOGRAPHER && role !== Role.ADMIN) return false;
  return (
    event.status === EventStatus.PUBLISHED || event.status === EventStatus.ARCHIVED
  );
}
