import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { routes } from "@/config/routes";
import { getProfileById } from "@/features/profile/infrastructure/profile.repository";
import { ProfileForm } from "@/features/profile/presentation/components/profile-form";
import { ChangePasswordForm } from "@/features/auth/presentation/components/change-password-form";

export default async function ClientProfilePage() {
  const session = await auth();
  if (!session?.user) redirect(routes.login);

  const profile = await getProfileById(session.user.id);
  if (!profile) redirect(routes.login);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">Mi perfil</h1>
      <p className="text-zinc-500">
        Datos que verán los fotógrafos cuando pidas una foto
      </p>
      <div className="mt-6">
        <ProfileForm profile={profile} />
      </div>

      <section className="mt-10 max-w-lg border-t border-white/10 pt-8">
        <h2 className="text-lg font-semibold">Seguridad</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Cambiá la contraseña de tu cuenta. Si entrás con Google, gestioná la contraseña desde tu
          cuenta de Google.
        </p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
