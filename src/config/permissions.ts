import type { UserRole } from "@/domain/enums/roles";

export type Permission =
  | "event:create"
  | "event:update"
  | "event:publish"
  | "event:delete"
  | "photo:upload"
  | "photo:manage"
  | "purchase-request:create"
  | "purchase-request:manage"
  | "admin:access";

export const permissions: Record<Permission, readonly UserRole[]> = {
  "event:create": ["photographer", "admin"],
  "event:update": ["photographer", "admin"],
  "event:publish": ["photographer", "admin"],
  "event:delete": ["photographer", "admin"],
  "photo:upload": ["photographer", "admin"],
  "photo:manage": ["photographer", "admin"],
  "purchase-request:create": ["client", "admin"],
  "purchase-request:manage": ["photographer", "admin"],
  "admin:access": ["admin"],
};

export function can(role: UserRole, action: Permission): boolean {
  return permissions[action].includes(role);
}
