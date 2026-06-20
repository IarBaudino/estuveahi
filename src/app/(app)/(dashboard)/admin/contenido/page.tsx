import { getLandingImagesForAdmin } from "@/features/platform/infrastructure/landing-settings.repository";
import { AdminLandingManager } from "@/features/admin/presentation/components/admin-landing-manager";

export default async function AdminContentPage() {
  const images = await getLandingImagesForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold">Contenido de la home</h1>
      <p className="mt-1 text-on-surface-variant">
        Cambiá las imágenes de la página principal. Se publican al instante.
      </p>
      <div className="mt-8">
        <AdminLandingManager images={images} />
      </div>
    </div>
  );
}
