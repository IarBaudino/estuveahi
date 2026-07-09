"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogIn, Menu, User, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  isDashboardNavActive,
  publicMobileMenuNav,
  publicMobileNav,
  type DashboardNavItem,
} from "@/shared/components/dashboard-nav-config";
import { routes } from "@/config/routes";
import { DASHBOARD_LINK_LABEL, getDashboardRoute } from "@/shared/lib/dashboard-route";
import type { UserRole } from "@/domain/enums/roles";

const HIDDEN_PREFIXES = [
  "/cliente",
  "/fotografo",
  "/admin",
  "/login",
  "/register",
  "/recuperar-contrasena",
];

function shouldShowPublicNav(pathname: string): boolean {
  return !HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function PublicMenuSheet({
  open,
  onClose,
  currentPath,
  dashboardHref,
  isAuthenticated,
}: {
  open: boolean;
  onClose: () => void;
  currentPath: string;
  dashboardHref: string;
  isAuthenticated: boolean;
}) {
  if (!open) return null;

  const items = isAuthenticated
    ? publicMobileMenuNav
    : publicMobileMenuNav.filter((item) => item.href !== routes.client.favorites);

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-zinc-950 p-4 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Menú</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-on-surface-variant hover:bg-white/5"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isAuthenticated && (
          <Link
            href={dashboardHref}
            onClick={onClose}
            className="mb-3 flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary"
          >
            <User className="h-4 w-4" />
            {DASHBOARD_LINK_LABEL}
          </Link>
        )}

        <nav className="space-y-1">
          {items.map((item) => (
            <PublicNavLink
              key={item.href}
              item={item}
              currentPath={currentPath}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <div className="mt-4 border-t border-white/10 pt-4">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                void signOut({ callbackUrl: routes.home });
              }}
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-on-surface-variant hover:bg-white/5"
            >
              Salir
            </button>
          ) : (
            <Link
              href={routes.login}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-on-surface-variant hover:bg-white/5"
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function PublicNavLink({
  item,
  currentPath,
  onNavigate,
  compact,
}: {
  item: DashboardNavItem;
  currentPath: string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const Icon = item.icon;
  const active = isDashboardNavActive(currentPath, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-surface-container-high font-medium text-on-surface"
          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
        compact && "min-w-0 flex-1 flex-col gap-0.5 px-1 py-1 text-[10px] sm:text-xs",
      )}
    >
      <Icon className={cn("shrink-0", compact ? "h-5 w-5" : "h-4 w-4")} />
      <span className={cn(compact && "truncate")}>
        {compact ? (item.shortLabel ?? item.label) : item.label}
      </span>
    </Link>
  );
}

export function PublicMobileNav() {
  const currentPath = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!shouldShowPublicNav(currentPath)) return null;

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const dashboardHref = isAuthenticated
    ? getDashboardRoute(session.user.role as UserRole | undefined)
    : routes.login;

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-md md:hidden"
        aria-label="Navegación principal"
      >
        <div className="flex items-stretch justify-around py-2">
          {publicMobileNav.map((item) => (
            <PublicNavLink key={item.href} item={item} currentPath={currentPath} compact />
          ))}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] sm:text-xs",
              menuOpen ? "font-medium text-white" : "text-on-surface-variant",
            )}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5 shrink-0" />
            <span className="truncate">Más</span>
          </button>
        </div>
      </nav>

      <PublicMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentPath={currentPath}
        dashboardHref={dashboardHref}
        isAuthenticated={isAuthenticated}
      />
    </>
  );
}
