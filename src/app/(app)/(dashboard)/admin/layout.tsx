import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { DashboardSidebar } from "@/shared/components/dashboard-sidebar";
import { routes } from "@/config/routes";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("[AdminLayout] auth:", error);
    redirect(routes.home);
  }

  if (!session?.user || session.user.role !== "admin") {
    redirect(routes.home);
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-0 px-0 sm:px-6">
      <DashboardSidebar type="admin" />
      <div className="min-w-0 flex-1 px-4 py-8 sm:px-0">{children}</div>
    </div>
  );
}
