import Link from "next/link";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { MaterialIcon } from "@/shared/components/icon";
import { LandingNavAuth } from "@/features/marketing/presentation/components/landing-nav-auth";

export function LandingNav() {
  return (
    <nav className="glass-nav fixed top-0 z-50 flex w-full items-center justify-between border-b border-white/10 px-margin-mobile py-4 md:px-margin-desktop">
      <Link
        href={routes.home}
        className="text-headline-md font-bold tracking-tighter text-primary"
      >
        EstuveAhí
      </Link>

      <div className="hidden items-center space-x-8 md:flex">
        <Link
          href={routes.events}
          className="text-label-sm tracking-widest text-on-surface-variant/70 transition-colors hover:text-primary"
        >
          Eventos
        </Link>
        <Link
          href={routes.photographers}
          className="text-label-sm tracking-widest text-on-surface-variant/70 transition-colors hover:text-primary"
        >
          {PHOTOGRAPHER_LABEL.pluralCap}
        </Link>
        <Link
          href={routes.becomePhotographer}
          className="text-label-sm tracking-widest text-on-surface-variant/70 transition-colors hover:text-primary"
        >
          Ser {PHOTOGRAPHER_LABEL.singular}
        </Link>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        <Link href={routes.events} aria-label="Buscar eventos">
          <MaterialIcon name="search" className="text-primary" />
        </Link>
        <LandingNavAuth />
      </div>
    </nav>
  );
}
