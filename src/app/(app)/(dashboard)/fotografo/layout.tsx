import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { getPhotographerApplicationStatus } from "@/features/auth/infrastructure/auth.repository";
import { DashboardSidebar } from "@/shared/components/dashboard-sidebar";
import { MobileDashboardNav } from "@/shared/components/mobile-dashboard-nav";
import { routes } from "@/config/routes";
import { PhotographerApplicationStatus } from "@/domain/enums/photographer-application-status";

export default async function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect(routes.login);

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/fotografo";
  const isOnboardingRoute = pathname.startsWith(routes.photographer.onboarding);

  if (session.user.role === "client" && !isOnboardingRoute) {
    const status = await getPhotographerApplicationStatus(session.user.id);
    if (status === PhotographerApplicationStatus.PENDING) {
      redirect(routes.photographer.onboardingPending);
    }
    redirect(routes.photographer.onboarding);
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-0 px-0 sm:px-6">
      <DashboardSidebar type="photographer" currentPath={pathname} />
      <div className="min-w-0 flex-1 px-4 py-8 pb-24 sm:px-0 md:pb-8">{children}</div>
      <MobileDashboardNav />
    </div>
  );
}
