import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { getPendingPhotographerApplicationsForAdmin } from "@/features/auth/infrastructure/auth.repository";
import { AdminPhotographerApplicationsTable } from "@/features/admin/presentation/components/admin-photographer-applications-table";

export default async function AdminPhotographersPage() {
  const applications = await getPendingPhotographerApplicationsForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold">Solicitudes de {PHOTOGRAPHER_LABEL.plural}</h1>
      <p className="text-on-surface-variant">
        Revisá y aprobá quién puede publicar eventos en la plataforma.
      </p>
      <div className="mt-6">
        <AdminPhotographerApplicationsTable applications={applications} />
      </div>
    </div>
  );
}
