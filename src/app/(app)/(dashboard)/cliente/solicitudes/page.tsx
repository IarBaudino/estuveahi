import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { routes } from "@/config/routes";
import { getClientRequests } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { ClientRequestsList } from "@/features/purchase-requests/presentation/components/client-requests-list";
import { businessConfig } from "@/config/business";

export default async function ClientRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect(routes.login);

  const requests = await getClientRequests(session.user.id);

  return (
    <div>
      <h1 className="text-headline-md">Mis solicitudes</h1>
      <p className="text-on-surface-variant">
        Seguimiento de tus pedidos a fotógrafos
      </p>
      <p className="text-caption mt-2 text-on-surface-variant/80">
        {businessConfig.deliveryDescription}
      </p>
      <div className="mt-6">
        <ClientRequestsList requests={requests} />
      </div>
    </div>
  );
}
