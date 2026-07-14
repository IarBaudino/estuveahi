import Link from "next/link";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { MaterialIcon } from "@/shared/components/icon";
import { SiteLogo } from "@/shared/components/site-logo";
import { LandingNavAuth } from "@/features/marketing/presentation/components/landing-nav-auth";

export function LandingNav() {
  return (
    <nav className="glass-nav fixed top-0 z-50 flex w-full items-center gap-2 border-b border-white/10 px-margin-mobile py-4 md:gap-0 md:px-margin-desktop">
      <SiteLogo />

      <div className="hidden items-center space-x-8 md:flex md:flex-1 md:justify-center">
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
          href={routes.hirePhotographer}
          className="text-label-sm tracking-widest text-on-surface-variant/70 transition-colors hover:text-primary"
        >
          Contratar
        </Link>
        <Link
          href={routes.becomePhotographer}
          className="text-label-sm tracking-widest text-on-surface-variant/70 transition-colors hover:text-primary"
        >
          Ser {PHOTOGRAPHER_LABEL.singular}
        </Link>
      </div>

      <nav
        className="flex min-w-0 flex-1 items-center justify-center gap-3 md:hidden"
        aria-label="Secciones"
      >
        <Link
          href={routes.events}
          className="text-label-sm truncate tracking-wider text-on-surface-variant/80 transition-colors hover:text-primary"
        >
          Eventos
        </Link>
        <Link
          href={routes.photographers}
          className="text-label-sm truncate tracking-wider text-on-surface-variant/80 transition-colors hover:text-primary"
        >
          {PHOTOGRAPHER_LABEL.pluralCap}
        </Link>
      </nav>

      <div className="flex shrink-0 items-center space-x-3 md:space-x-6">
        <Link href={routes.events} aria-label="Buscar eventos">
          <MaterialIcon name="search" className="text-primary" />
        </Link>
        <LandingNavAuth />
      </div>
    </nav>
  );
}
