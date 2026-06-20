import { auth } from "@/infrastructure/auth";
import { getPhotographerRequests } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { PhotographerRequestsList } from "@/features/purchase-requests/presentation/components/photographer-requests-list";
import { businessConfig } from "@/config/business";

export default async function PhotographerRequestsPage() {
  const session = await auth();
  const requests = await getPhotographerRequests(session!.user.id);

  return (
    <div>
      <h1 className="text-headline-md">Solicitudes de compra</h1>
      <p className="text-on-surface-variant">
        Cotizá, cobrá directamente al cliente y enviá la foto en alta.
      </p>
      <p className="text-caption mt-2 text-on-surface-variant/80">
        {businessConfig.noPlatformFeeMessage}
      </p>
      <div className="mt-6">
        <PhotographerRequestsList requests={requests} />
      </div>
    </div>
  );
}
