import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { getPhotographerApplicationStatus } from "@/features/auth/infrastructure/auth.repository";
import { routes } from "@/config/routes";
import { PhotographerApplicationStatus } from "@/domain/enums/photographer-application-status";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (
    session?.user?.role === "photographer" ||
    session?.user?.role === "admin"
  ) {
    redirect(routes.photographer.dashboard);
  }

  if (session?.user?.id) {
    const status = await getPhotographerApplicationStatus(session.user.id);

    if (status === PhotographerApplicationStatus.PENDING) {
      redirect(routes.photographer.dashboard);
    }

    if (status === PhotographerApplicationStatus.APPROVED) {
      redirect(routes.photographer.dashboard);
    }
  }

  return children;
}
