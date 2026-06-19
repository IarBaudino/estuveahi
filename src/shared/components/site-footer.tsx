import Link from "next/link";
import { Fragment } from "react";
import { routes } from "@/config/routes";
import { cn } from "@/shared/lib/utils";

const links = [
  { href: routes.events, label: "Eventos" },
  { href: routes.register, label: "Registro" },
  { href: routes.login, label: "Ingresar" },
  { href: routes.legal.privacy, label: "Privacidad" },
  { href: routes.legal.terms, label: "Términos" },
  { href: routes.legal.hub, label: "Legales" },
] as const;

export function SiteFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-white/10", className)}>
      <div className="mx-auto flex max-w-container-max flex-col gap-3 px-margin-mobile py-4 sm:flex-row sm:items-center sm:justify-between md:px-margin-desktop">
        <div className="flex shrink-0 items-baseline gap-2">
          <span className="text-xs font-medium tracking-tight text-primary">
            EstuveAhí
          </span>
          <span className="text-[10px] text-on-surface-variant/40">
            © {year}
          </span>
        </div>

        <nav
          aria-label="Enlaces del sitio"
          className="flex flex-wrap items-center gap-x-2.5 gap-y-1"
        >
          {links.map((link, index) => (
            <Fragment key={link.href}>
              {index > 0 && (
                <span className="text-[10px] text-white/15" aria-hidden>
                  ·
                </span>
              )}
              <Link
                href={link.href}
                className="text-[10px] uppercase tracking-wider text-on-surface-variant/60 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            </Fragment>
          ))}
        </nav>
      </div>
    </footer>
  );
}
