import { routes } from "@/config/routes";
import type { UserRole } from "@/domain/enums/roles";
import { Role } from "@/domain/enums/roles";

export const DASHBOARD_LINK_LABEL = "Mi panel";

export function getDashboardRoute(role: UserRole | undefined): string {
  if (role === Role.ADMIN) return routes.admin.dashboard;
  if (role === Role.PHOTOGRAPHER) return routes.photographer.dashboard;
  return routes.client.dashboard;
}
