"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { routes } from "@/config/routes";

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
    const isClient = session.user.role === "client";

    return (
      <div className="flex items-center gap-3">
        {isClient && (
          <Link
            href={routes.photographer.onboarding}
            className="text-label-sm hidden tracking-widest text-on-surface-variant transition-colors hover:text-primary sm:inline"
          >
            Ser fotógrafo
          </Link>
        )}
        <Link
          href={routes.client.dashboard}
          className="text-label-sm hidden tracking-widest text-on-surface-variant transition-colors hover:text-primary md:inline"
        >
          Mi cuenta
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: routes.home })}
          className="text-label-sm bg-primary px-4 py-2 tracking-widest text-background transition-colors duration-300 hover:bg-on-surface-variant md:px-6"
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
