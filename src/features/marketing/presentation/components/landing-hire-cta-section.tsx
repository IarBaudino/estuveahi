import Link from "next/link";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";

export function LandingHireCtaSection() {
  return (
    <section className="mx-auto max-w-container-max px-margin-mobile py-section-compact md:px-margin-desktop">
      <div className="grid gap-8 border border-white/10 bg-zinc-950/60 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:items-center md:px-10 md:py-12">
        <div className="space-y-4">
          <span className="text-label-sm block tracking-[0.3em] text-on-surface-variant/50">
            Organizás
          </span>
          <h2 className="text-headline-lg">¿Tenés un show y necesitás fotografx?</h2>
          <p className="text-body-lg max-w-xl text-on-surface-variant">
            Bandas, productoras y organizadores pueden pedirnos cobertura. Te
            conectamos con {PHOTOGRAPHER_LABEL.plural} de la plataforma según
            provincia y tipo de evento.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-start md:items-end">
          <Link
            href={routes.hirePhotographer}
            className="text-label-sm inline-block bg-primary px-10 py-4 tracking-widest text-background transition-all hover:opacity-90"
          >
            Quiero contratar
          </Link>
          <Link
            href={routes.photographers}
            className="text-label-sm tracking-widest text-on-surface-variant underline-offset-4 hover:text-primary hover:underline"
          >
            Ver {PHOTOGRAPHER_LABEL.plural} primero
          </Link>
        </div>
      </div>
    </section>
  );
}
