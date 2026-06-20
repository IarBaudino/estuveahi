import Link from "next/link";
import { routes } from "@/config/routes";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export default function PhotographerOnboardingPendingPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Solicitud enviada</CardTitle>
          <CardDescription>
            Tu perfil de fotógrafo está en revisión. Te avisaremos cuando un administrador
            lo apruebe y puedas crear eventos.
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
