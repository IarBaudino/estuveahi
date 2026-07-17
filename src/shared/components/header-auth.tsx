"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { routes } from "@/config/routes";
import { MaterialIcon } from "@/shared/components/icon";
import { DASHBOARD_LINK_LABEL, getDashboardRoute } from "@/shared/lib/dashboard-route";

export function HeaderAuth() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const dashboardHref = user?.role ? getDashboardRoute(user.role) : null;

  if (status === "loading") {
    return (
      <div className="h-9 w-20 animate-pulse bg-white/10" aria-hidden />
    );
  }

  if (user && dashboardHref) {
    return (
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
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: routes.home })}
          className="text-label-sm border border-white/20 px-3 py-2 tracking-widest text-primary transition-colors hover:bg-white/5 sm:px-4"
        >
          Salir
        </button>
      </>
    );
  }

  return (
    <Link
      href={routes.login}
      className="text-label-sm bg-primary px-4 py-2 tracking-widest text-background transition-opacity hover:opacity-90"
    >
      Entrar
    </Link>
  );
}
