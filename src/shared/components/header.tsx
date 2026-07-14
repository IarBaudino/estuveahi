import Link from "next/link";
import { getServerSessionUser } from "@/infrastructure/auth/session";
import { signOut } from "@/infrastructure/auth";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { MaterialIcon } from "@/shared/components/icon";
import { SiteLogo } from "@/shared/components/site-logo";
import { DASHBOARD_LINK_LABEL, getDashboardRoute } from "@/shared/lib/dashboard-route";

export async function Header() {
  let user = null;
  try {
    user = await getServerSessionUser();
  } catch (error) {
    console.error("[Header] auth:", error);
  }

  const dashboardHref = user ? getDashboardRoute(user.role) : null;

  return (
    <header className="glass-nav fixed top-0 z-50 w-full border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-container-max items-center gap-2 px-margin-mobile md:gap-0 md:px-margin-desktop">
        <SiteLogo />

        <nav className="hidden items-center gap-8 md:flex md:flex-1 md:justify-center">
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
        </nav>

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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href={routes.events} aria-label="Buscar">
            <MaterialIcon name="search" className="text-primary" />
          </Link>
          {user && dashboardHref ? (
            <>
              <Link
                href={dashboardHref}
                className="text-label-sm inline-flex items-center gap-1.5 border border-primary/40 bg-primary/10 px-3 py-2 tracking-widest text-primary transition-colors hover:bg-primary/20"
                aria-label={DASHBOARD_LINK_LABEL}
              >
                <MaterialIcon name="dashboard" className="text-base sm:hidden" />
                <span>{DASHBOARD_LINK_LABEL}</span>
              </Link>
              <Link
                href={routes.client.favorites}
                className="text-label-sm hidden tracking-widest text-on-surface-variant hover:text-primary sm:inline"
              >
                Favoritos
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: routes.home });
                }}
              >
                <button
                  type="submit"
                  className="text-label-sm border border-white/20 px-3 py-2 tracking-widest text-primary transition-colors hover:bg-white/5 sm:px-4"
                >
                  Salir
                </button>
              </form>
            </>
          ) : (
            <Link
              href={routes.login}
              className="text-label-sm bg-primary px-4 py-2 tracking-widest text-background transition-opacity hover:opacity-90"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
