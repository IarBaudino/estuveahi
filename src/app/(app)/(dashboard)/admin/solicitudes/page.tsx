import { getAllRequestsForAdmin } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { AdminRequestsTable } from "@/features/admin/presentation/components/admin-requests-table";

export default async function AdminRequestsPage() {
  const requests = await getAllRequestsForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold">Solicitudes</h1>
      <p className="text-on-surface-variant">
        {requests.length} solicitudes de compra
      </p>
      <div className="mt-6">
        <AdminRequestsTable requests={requests} />
      </div>
    </div>
  );
}
