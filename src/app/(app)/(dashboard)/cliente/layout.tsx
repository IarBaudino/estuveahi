import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/infrastructure/auth/session";
import { ClientDashboardShell } from "@/shared/components/client-shell";
import { routes } from "@/config/routes";

export const dynamic = "force-dynamic";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSessionUser();
  if (!user) redirect(routes.login);

  return <ClientDashboardShell>{children}</ClientDashboardShell>;
}
