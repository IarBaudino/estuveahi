import { getAllRequestsForAdmin } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { listHireRequestsForAdmin } from "@/features/hire-requests/infrastructure/hire-request.repository";
import {
  listLeadsForHireRequest,
  listPhotographersAvailableForHire,
} from "@/features/hire-requests/infrastructure/hire-lead.repository";
import { AdminRequestsTable } from "@/features/admin/presentation/components/admin-requests-table";
import { AdminHireRequestsTable } from "@/features/admin/presentation/components/admin-hire-requests-table";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import type { HireLeadPhotographerSummary } from "@/domain/entities/hire-lead";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminRequestsPage() {
  const [requests, hireRequests, availablePhotographers] = await Promise.all([
    getAllRequestsForAdmin(),
    listHireRequestsForAdmin(),
    listPhotographersAvailableForHire(),
  ]);

  const matchesByRequestId: Record<string, HireLeadPhotographerSummary[]> = {};

  await Promise.all(
    hireRequests.map(async (request) => {
      const leads = await listLeadsForHireRequest(request.id);
      const leadByPhotographer = new Map(
        leads.map((lead) => [lead.photographerId, lead]),
      );

      matchesByRequestId[request.id] = availablePhotographers
        .filter((photographer) =>
          photographer.coverageProvinces.includes(request.province),
        )
        .map((photographer) => {
          const lead = leadByPhotographer.get(photographer.id);
          return {
            ...photographer,
            alreadyNotified: Boolean(lead),
            leadStatus: lead?.status ?? null,
          };
        });
    }),
  );

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-2xl font-bold">Solicitudes</h1>
        <p className="text-on-surface-variant">
          {requests.length} solicitudes de compra
        </p>
        <div className="mt-6">
          <AdminRequestsTable requests={requests} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">
          Contratar {PHOTOGRAPHER_LABEL.singular}
        </h2>
        <p className="text-on-surface-variant">
          {hireRequests.length} consultas de organizadores / bandas. Elegí fotografxs
          de la zona, avisales por WhatsApp y / o enviales el lead al panel.
        </p>
        <div className="mt-6">
          <AdminHireRequestsTable
            requests={hireRequests}
            matchesByRequestId={matchesByRequestId}
          />
        </div>
      </section>
    </div>
  );
}
