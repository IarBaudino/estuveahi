import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { getPhotographerApplicationStatus } from "@/features/auth/infrastructure/auth.repository";
import { DashboardSidebar } from "@/shared/components/dashboard-sidebar";
import { MobileDashboardNav } from "@/shared/components/mobile-dashboard-nav";
import { PhotographerAccessGuard } from "@/shared/components/photographer-access-guard";
import { routes } from "@/config/routes";
import { PhotographerApplicationStatus } from "@/domain/enums/photographer-application-status";

export default async function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("[PhotographerLayout] auth:", error);
    redirect(routes.login);
  }

  if (!session?.user) redirect(routes.login);

  let isPending = false;

  if (session.user.role === "client") {
    let status: PhotographerApplicationStatus | null = null;
    try {
      status = await getPhotographerApplicationStatus(session.user.id);
    } catch (error) {
      console.error("[PhotographerLayout] application status:", error);
    }

    if (status === PhotographerApplicationStatus.PENDING) {
      isPending = true;
    } else if (status !== PhotographerApplicationStatus.APPROVED) {
      redirect(routes.photographer.onboarding);
    }
  }

  return (
    <PhotographerAccessGuard isPending={isPending}>
      <div className="mx-auto flex max-w-7xl gap-0 px-0 sm:px-6">
        <DashboardSidebar type="photographer" />
        <div className="min-w-0 flex-1 px-4 py-8 pb-24 sm:px-0 md:pb-8">{children}</div>
        <MobileDashboardNav />
      </div>
    </PhotographerAccessGuard>
  );
}
