import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/infrastructure/auth/session";
import { AdminDashboardShell } from "@/shared/components/dashboard-shell";
import { routes } from "@/config/routes";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSessionUser();
  if (!user || user.role !== "admin") {
    redirect(routes.home);
  }

  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
