import Link from "next/link";
import { legalConfig, legalDocuments } from "@/config/legal";
import { routes } from "@/config/routes";

export function LegalHub() {
  return (
    <div className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop md:py-16">
      <h1 className="text-headline-lg text-primary">Información legal</h1>
      <p className="mt-4 max-w-2xl text-on-surface-variant">
        Documentos que regulan el uso de {legalConfig.responsible.businessName !== "[Razón social o nombre del titular]" ? legalConfig.responsible.businessName : "EstuveAhí"}, el tratamiento de datos personales y los derechos de usuarios, fotógrafos y visitantes en la República Argentina.
      </p>
      <p className="text-caption mt-2 text-on-surface-variant/60">
        Última actualización: {legalConfig.lastUpdated}
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {legalDocuments.map((doc) => (
          <Link
            key={doc.slug}
            href={routes.legal.document(doc.slug)}
            className="group hairline-border rounded-xl p-6 transition-colors hover:bg-white/5"
          >
            <h2 className="font-semibold text-primary group-hover:underline">
              {doc.title}
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">{doc.description}</p>
          </Link>
        ))}
      </div>

      <div className="hairline-border mt-12 rounded-xl p-6 text-sm text-on-surface-variant">
        <h2 className="font-semibold text-primary">Titular del sitio</h2>
        <ul className="mt-4 space-y-2">
          <li>
            <span className="text-on-surface-variant/60">Denominación: </span>
            {legalConfig.responsible.businessName}
          </li>
          <li>
            <span className="text-on-surface-variant/60">CUIT: </span>
            {legalConfig.responsible.cuit}
          </li>
          <li>
            <span className="text-on-surface-variant/60">Domicilio: </span>
            {legalConfig.responsible.address}
          </li>
          <li>
            <span className="text-on-surface-variant/60">Contacto: </span>
            <a
              href={`mailto:${legalConfig.responsible.email}`}
              className="text-primary hover:underline"
            >
              {legalConfig.responsible.email}
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
