import type { Metadata } from "next";
import Link from "next/link";
import { HirePhotographerForm } from "@/features/hire-requests/presentation/components/hire-photographer-form";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";

export const metadata: Metadata = {
  title: `Contratar ${PHOTOGRAPHER_LABEL.singular}`,
  description: `Pedí un ${PHOTOGRAPHER_LABEL.singular} para tu show, banda o evento. Te conectamos con profesionales de EstuveAhí.`,
};

export default function HirePhotographerPage() {
  return (
    <div className="mx-auto max-w-lg px-margin-mobile py-12 md:px-margin-desktop">
      <div className="mb-6">
        <Link href={routes.photographers} className="text-sm text-on-surface-variant underline">
          ← Ver {PHOTOGRAPHER_LABEL.plural}
        </Link>
      </div>
      <div className="mb-8">
        <span className="text-label-sm mb-3 block tracking-[0.3em] text-on-surface-variant/50">
          Organizás un evento
        </span>
        <h1 className="text-headline-lg">Necesitás cobertura fotográfica</h1>
        <p className="mt-2 text-on-surface-variant">
          Bandas, productoras o quien organice un show: dejá tu consulta y te
          acercamos {PHOTOGRAPHER_LABEL.plural} verificadxs de la plataforma.
        </p>
      </div>
      <HirePhotographerForm />
    </div>
  );
}
