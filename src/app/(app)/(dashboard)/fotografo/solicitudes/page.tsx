import { auth } from "@/infrastructure/auth";
import { getPhotographerRequests } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { PhotographerRequestsList } from "@/features/purchase-requests/presentation/components/photographer-requests-list";
import { listHireLeadsForPhotographer } from "@/features/hire-requests/infrastructure/hire-lead.repository";
import { PhotographerHireLeadsList } from "@/features/hire-requests/presentation/components/photographer-hire-leads-list";
import { getPhotographerProfile } from "@/features/auth/infrastructure/auth.repository";
import { businessConfig } from "@/config/business";
import Link from "next/link";
import { routes } from "@/config/routes";

export default async function PhotographerRequestsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [requests, hireLeads, photographerProfile] = await Promise.all([
    getPhotographerRequests(userId),
    listHireLeadsForPhotographer(userId),
    getPhotographerProfile(userId),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-headline-md">Consultas para contratar</h1>
        <p className="text-on-surface-variant">
          Cuando el admin te avisa de un trabajo en tu zona, contactá al interesado por
          WhatsApp desde acá.
        </p>
        {(!photographerProfile?.availableForHire ||
          (photographerProfile.coverageProvinces?.length ?? 0) === 0) && (
          <p className="mt-2 text-sm text-amber-200/90">
            Para recibir avisos, activá disponibilidad y elegí provincias en{" "}
            <Link href={routes.photographer.profile} className="underline">
              tu perfil
            </Link>
            .
          </p>
        )}
        <div className="mt-6">
          <PhotographerHireLeadsList
            leads={hireLeads}
            photographerDisplayName={photographerProfile?.displayName}
          />
        </div>
      </section>

      <section>
        <h2 className="text-headline-md">Solicitudes de compra</h2>
        <p className="text-on-surface-variant">
          Cotizá, cobrá directamente al cliente y enviá la foto en alta. Podés ocultar o
          eliminar pedidos de prueba desde esta pantalla.
        </p>
        <p className="text-caption mt-2 text-on-surface-variant/80">
          {businessConfig.noPlatformFeeMessage}
        </p>
        <div className="mt-6">
          <PhotographerRequestsList requests={requests} />
        </div>
      </section>
    </div>
  );
}
