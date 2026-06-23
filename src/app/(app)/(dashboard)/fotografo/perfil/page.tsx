import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/infrastructure/auth/session";
import { routes } from "@/config/routes";
import { getPhotographerProfile } from "@/features/auth/infrastructure/auth.repository";
import { getProfileById } from "@/features/profile/infrastructure/profile.repository";
import { PhotographerProfilePanel } from "@/features/auth/presentation/components/photographer-profile-panel";
import { Button } from "@/shared/ui/button";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";

export default async function PhotographerProfilePage() {
  const user = await getServerSessionUser();
  if (!user) redirect(routes.login);

  const [photographerProfile, accountProfile] = await Promise.all([
    getPhotographerProfile(user.id),
    getProfileById(user.id),
  ]);

  if (!accountProfile) {
    redirect(routes.login);
  }

  if (!photographerProfile) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold">Perfil de {PHOTOGRAPHER_LABEL.singular}</h1>
        <p className="mt-2 text-on-surface-variant">
          Todavía no configuraste tu perfil público de {PHOTOGRAPHER_LABEL.singular}. Completalo
          para aparecer en el catálogo y gestionar tus eventos.
        </p>
        <Link href={routes.becomePhotographer} className="mt-6 inline-block">
          <Button>Configurar perfil de {PHOTOGRAPHER_LABEL.singular}</Button>
        </Link>
      </div>
    );
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
          email={user.email ?? ""}
        />
      </div>
    </div>
  );
}
