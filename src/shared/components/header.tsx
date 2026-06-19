import Link from "next/link";
import { auth, signOut } from "@/infrastructure/auth";
import { routes } from "@/config/routes";
import { MaterialIcon } from "@/shared/components/icon";

export async function Header() {
  const session = await auth();

  return (
    <header className="glass-nav fixed top-0 z-50 w-full border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop">
        <Link
          href={routes.home}
          className="text-headline-md font-bold tracking-tighter text-primary"
        >
          EstuveAhí
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href={routes.events}
            className="text-label-sm tracking-widest text-on-surface-variant/70 transition-colors hover:text-primary"
          >
            Eventos
          </Link>
          {session?.user?.role === "photographer" && (
            <Link
              href={routes.photographer.dashboard}
              className="text-label-sm tracking-widest text-on-surface-variant/70 transition-colors hover:text-primary"
            >
              Panel fotógrafo
            </Link>
          )}
          {session?.user?.role === "admin" && (
            <Link
              href={routes.admin.dashboard}
              className="text-label-sm tracking-widest text-on-surface-variant/70 transition-colors hover:text-primary"
            >
              Admin
            </Link>
          )}
          {session?.user && (
            <Link
              href={routes.client.dashboard}
              className="text-label-sm tracking-widest text-on-surface-variant/70 transition-colors hover:text-primary"
            >
              Mi cuenta
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link href={routes.events} aria-label="Buscar">
            <MaterialIcon name="search" className="text-primary" />
          </Link>
          {session?.user ? (
            <>
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
                  className="text-label-sm border border-white/20 px-4 py-2 tracking-widest text-primary transition-colors hover:bg-white/5"
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
