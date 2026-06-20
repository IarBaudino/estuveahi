import { businessConfig } from "@/config/business";
import { legalConfig } from "@/config/legal";
import { routes } from "@/config/routes";
import Link from "next/link";

export default function AdminConfigPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <p className="text-on-surface-variant">
        Parámetros de la plataforma (solo lectura)
      </p>

      <div className="mt-8 space-y-4">
        <section className="hairline-border bg-surface-container p-5">
          <h2 className="font-semibold">Modelo de negocio</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Comisión plataforma</dt>
              <dd className="font-medium">{businessConfig.platformCommissionPercent}%</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Entrega manual</dt>
              <dd className="font-medium">
                {businessConfig.manualDeliveryByPhotographer ? "Sí" : "No"}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-on-surface-variant">
            {businessConfig.noPlatformFeeMessage}
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            {businessConfig.deliveryDescription}
          </p>
        </section>

        <section className="hairline-border bg-surface-container p-5">
          <h2 className="font-semibold">Datos legales</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Razón social</dt>
              <dd className="text-right font-medium">
                {legalConfig.responsible.businessName}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">CUIT</dt>
              <dd className="font-medium">{legalConfig.responsible.cuit}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Email</dt>
              <dd className="font-medium">{legalConfig.responsible.email}</dd>
            </div>
          </dl>
          <Link
            href={routes.legal.hub}
            className="mt-4 inline-block text-sm underline"
          >
            Ver documentos legales
          </Link>
        </section>
      </div>
    </div>
  );
}
