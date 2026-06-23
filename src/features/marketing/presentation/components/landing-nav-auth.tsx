"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { MaterialIcon } from "@/shared/components/icon";
import { DASHBOARD_LINK_LABEL, getDashboardRoute } from "@/shared/lib/dashboard-route";
import type { UserRole } from "@/domain/enums/roles";

export function LandingNavAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="text-label-sm px-4 py-2 tracking-widest text-on-surface-variant md:px-6">
        …
      </span>
    );
  }

  if (session?.user) {
    const role = session.user.role as UserRole | undefined;
    const isClient = role === "client";
    const dashboardHref = getDashboardRoute(role);

    return (
      <div className="flex items-center gap-2 sm:gap-3">
        {isClient && (
          <Link
            href={routes.becomePhotographer}
            className="text-label-sm hidden tracking-widest text-on-surface-variant transition-colors hover:text-primary sm:inline"
          >
            Ser {PHOTOGRAPHER_LABEL.singular}
          </Link>
        )}
        <Link
          href={dashboardHref}
          className="text-label-sm inline-flex items-center gap-1.5 border border-primary/40 bg-primary/10 px-3 py-2 tracking-widest text-primary transition-colors hover:bg-primary/20"
          aria-label={DASHBOARD_LINK_LABEL}
        >
          <MaterialIcon name="dashboard" className="text-base sm:hidden" />
          <span>{DASHBOARD_LINK_LABEL}</span>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: routes.home })}
          className="text-label-sm bg-primary px-3 py-2 tracking-widest text-background transition-colors duration-300 hover:bg-on-surface-variant sm:px-4 md:px-6"
        >
          Salir
        </button>
      </div>
    );
  }

  return (
    <Link
      href={routes.login}
      className="text-label-sm bg-primary px-4 py-2 tracking-widest text-background transition-colors duration-300 hover:opacity-90 md:px-6"
    >
      Entrar
    </Link>
  );
}
