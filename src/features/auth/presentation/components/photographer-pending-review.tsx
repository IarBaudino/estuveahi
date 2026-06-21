import Link from "next/link";
import { Clock } from "lucide-react";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export function PhotographerPendingReview() {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{PHOTOGRAPHER_LABEL.panel}</h1>
          <p className="text-on-surface-variant">Tu solicitud está siendo evaluada</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200">
          <Clock className="h-4 w-4" />
          Esperando revisión
        </span>
      </div>

      <Card className="mt-8 hairline-border bg-surface-container">
        <CardHeader>
          <CardTitle>Solicitud enviada</CardTitle>
          <CardDescription>
            Un administrador debe aprobar tu perfil antes de que puedas crear eventos y subir
            fotografías. Te avisaremos cuando esté listo; mientras tanto podés seguir usando tu
            cuenta de cliente.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <Link
            href={routes.client.dashboard}
            className="text-sm font-medium underline"
          >
            Volver a mi cuenta
          </Link>
        </div>
      </Card>
    </div>
  );
}
