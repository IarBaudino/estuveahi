import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { routes } from "@/config/routes";
import { getPhotographerProfile } from "@/features/auth/infrastructure/auth.repository";
import { getProfileById } from "@/features/profile/infrastructure/profile.repository";
import { PhotographerProfilePanel } from "@/features/auth/presentation/components/photographer-profile-panel";

export default async function PhotographerProfilePage() {
  const session = await auth();
  if (!session?.user) redirect(routes.login);

  const [photographerProfile, accountProfile] = await Promise.all([
    getPhotographerProfile(session.user.id),
    getProfileById(session.user.id),
  ]);

  if (!photographerProfile || !accountProfile) {
    redirect(routes.becomePhotographer);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <p className="mt-1 text-on-surface-variant">
        Perfil público y datos de tu cuenta
      </p>
      <div className="mt-6">
        <PhotographerProfilePanel
          photographerProfile={{
            ...photographerProfile,
            createdAt: new Date(),
            updatedAt: new Date(),
          }}
          accountProfile={accountProfile}
          email={session.user.email ?? ""}
        />
      </div>
    </div>
  );
}
