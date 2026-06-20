import Link from "next/link";
import { businessConfig } from "@/config/business";
import { routes } from "@/config/routes";
import { legalConfig } from "@/config/legal";
import { DollarSign, Truck, Percent, FileText } from "lucide-react";

export default function PhotographerSettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Ajustes</h1>
      <p className="mt-1 text-on-surface-variant">
        Información sobre cómo funciona la plataforma para fotógrafos
      </p>

      <div className="mt-8 space-y-4">
        <div className="hairline-border bg-surface-container p-5">
          <div className="flex items-center gap-3">
            <Percent className="h-5 w-5" />
            <h2 className="font-semibold">Comisión de plataforma</h2>
          </div>
          <p className="mt-3 text-sm text-on-surface-variant">
            {businessConfig.noPlatformFeeMessage}
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {businessConfig.platformCommissionPercent}%
          </p>
        </div>

        <div className="hairline-border bg-surface-container p-5">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5" />
            <h2 className="font-semibold">Entrega de fotos</h2>
          </div>
          <p className="mt-3 text-sm text-on-surface-variant">
            {businessConfig.deliveryDescription}
          </p>
        </div>

        <div className="hairline-border bg-surface-container p-5">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5" />
            <h2 className="font-semibold">Precios</h2>
          </div>
          <p className="mt-3 text-sm text-on-surface-variant">
            Fijá el precio de cada foto desde la gestión del evento. Los clientes
            verán el número de foto (#1, #2…) al solicitarla.
          </p>
          <Link
            href={routes.photographer.events}
            className="mt-3 inline-block text-sm underline"
          >
            Ir a mis eventos
          </Link>
        </div>

        <div className="hairline-border bg-surface-container p-5">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            <h2 className="font-semibold">Documentos legales</h2>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href={routes.legal.terms} className="underline">
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link href={routes.legal.privacy} className="underline">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link href={routes.legal.intellectualProperty} className="underline">
                Propiedad intelectual
              </Link>
            </li>
          </ul>
          <p className="mt-3 text-xs text-on-surface-variant">
            Contacto: {legalConfig.responsible.supportEmail}
          </p>
        </div>
      </div>
    </div>
  );
}
