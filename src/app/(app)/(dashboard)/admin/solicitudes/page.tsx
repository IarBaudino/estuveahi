import { getAllRequestsForAdmin } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { listHireRequestsForAdmin } from "@/features/hire-requests/infrastructure/hire-request.repository";
import {
  listLeadsForHireRequest,
  listPhotographersAvailableForHire,
} from "@/features/hire-requests/infrastructure/hire-lead.repository";
import { AdminRequestsTable } from "@/features/admin/presentation/components/admin-requests-table";
import { AdminHireRequestsTable } from "@/features/admin/presentation/components/admin-hire-requests-table";
import { AdminHireAvailablePhotographers } from "@/features/admin/presentation/components/admin-hire-available-photographers";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import type { HireLeadPhotographerSummary } from "@/domain/entities/hire-lead";
import { HireRequestStatus } from "@/domain/enums/hire-request-status";

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

  const pendingHire = hireRequests.filter(
    (request) => request.status === HireRequestStatus.PENDING,
  ).length;

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold">Solicitudes</h1>
        <p className="mt-1 text-on-surface-variant">
          Acá están las consultas para contratar {PHOTOGRAPHER_LABEL.singular}, quiénes
          quieren recibir avisos, y los pedidos de compra de fotos.
        </p>
        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <a href="#contratar" className="text-primary underline-offset-4 hover:underline">
            Contratar ({hireRequests.length}
            {pendingHire > 0 ? ` · ${pendingHire} pendientes` : ""})
          </a>
          <a
            href="#disponibles"
            className="text-primary underline-offset-4 hover:underline"
          >
            Disponibles para avisar ({availablePhotographers.length})
          </a>
          <a href="#compras" className="text-primary underline-offset-4 hover:underline">
            Compras de fotos ({requests.length})
          </a>
        </nav>
      </div>

      <section id="contratar" className="scroll-mt-24">
        <h2 className="text-xl font-semibold">
          Contratar {PHOTOGRAPHER_LABEL.singular}
        </h2>
        <p className="mt-1 text-on-surface-variant">
          Consultas desde el formulario público. Abrí “Avisar fotografxs” en cada fila
          para contactarlos por WhatsApp o enviarles el lead al panel.
        </p>
        <div className="mt-6">
          <AdminHireRequestsTable
            requests={hireRequests}
            matchesByRequestId={matchesByRequestId}
          />
        </div>
      </section>

      <section id="disponibles" className="scroll-mt-24">
        <h2 className="text-xl font-semibold">
          {PHOTOGRAPHER_LABEL.pluralCap} que quieren avisos
        </h2>
        <p className="mt-1 text-on-surface-variant">
          Activaron “recibir consultas” y cargaron provincias en su perfil. Cuando llega
          un pedido de su zona, aparecen en “Avisar fotografxs”.
        </p>
        <div className="mt-6">
          <AdminHireAvailablePhotographers photographers={availablePhotographers} />
        </div>
        <p className="mt-3 text-sm text-on-surface-variant">
          Si no ves a alguien, pedile que complete cobertura en su panel → Perfil.
        </p>
      </section>

      <section id="compras" className="scroll-mt-24">
        <h2 className="text-xl font-semibold">Compras de fotos</h2>
        <p className="mt-1 text-on-surface-variant">
          {requests.length} solicitudes de compra entre clientes y {PHOTOGRAPHER_LABEL.plural}
        </p>
        <div className="mt-6">
          <AdminRequestsTable requests={requests} />
        </div>
      </section>
    </div>
  );
}
