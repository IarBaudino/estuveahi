import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { routes } from "@/config/routes";
import { getProfileById } from "@/features/profile/infrastructure/profile.repository";
import { ProfileForm } from "@/features/profile/presentation/components/profile-form";

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
    </div>
  );
}
