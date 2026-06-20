import { getLandingSettingsForAdmin } from "@/features/platform/infrastructure/landing-settings.repository";
import { AdminLandingManager } from "@/features/admin/presentation/components/admin-landing-manager";

export default async function AdminContentPage() {
  const settings = await getLandingSettingsForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold">Contenido de la home</h1>
      <p className="mt-1 text-on-surface-variant">
        Cambiá las imágenes de la página principal y elegí si se publican a color o en blanco y negro.
      </p>
      <div className="mt-8">
        <AdminLandingManager images={settings.images} grayscale={settings.grayscale} />
      </div>
    </div>
  );
}
