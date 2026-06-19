import { routes } from "@/config/routes";
import type { UserRole } from "@/domain/enums/roles";

export function getDashboardForRole(role: UserRole): string {
  switch (role) {
    case "admin":
      return routes.admin.dashboard;
    case "photographer":
      return routes.photographer.dashboard;
    default:
      return routes.client.dashboard;
  }
}
