import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getServerSessionUser } from "@/infrastructure/auth/session";
import { getPhotographerApplicationStatus } from "@/features/auth/infrastructure/auth.repository";
import { PhotographerDashboardShell } from "@/shared/components/dashboard-shell";
import { routes } from "@/config/routes";
import { PhotographerApplicationStatus } from "@/domain/enums/photographer-application-status";

export const dynamic = "force-dynamic";

export default async function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSessionUser();
  if (!user) redirect(routes.login);

  let isPending = false;

  if (user.role === "client") {
    let status: PhotographerApplicationStatus | null = null;
    try {
      status = await getPhotographerApplicationStatus(user.id);
    } catch (error) {
      console.error("[PhotographerLayout] application status:", error);
    }

    if (status === PhotographerApplicationStatus.PENDING) {
      isPending = true;
    } else if (status !== PhotographerApplicationStatus.APPROVED) {
      redirect(routes.becomePhotographer);
    }
  } else if (user.role !== "photographer" && user.role !== "admin") {
    redirect(routes.home);
  }

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 text-on-surface-variant">
          Cargando panel…
        </div>
      }
    >
      <PhotographerDashboardShell isPending={isPending}>{children}</PhotographerDashboardShell>
    </Suspense>
  );
}
