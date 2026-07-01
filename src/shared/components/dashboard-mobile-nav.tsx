"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X, Heart } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  adminNav,
  adminPhotographerLinks,
  clientMobileNav,
  isDashboardNavActive,
  photographerAdminLink,
  photographerNav,
  type DashboardNavItem,
} from "@/shared/components/dashboard-nav-config";
import { routes } from "@/config/routes";

function NavLink({
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
        compact && "flex-col gap-0.5 px-1 py-1 text-[10px] sm:text-xs",
      )}
    >
      <Icon className={cn("shrink-0", compact ? "h-5 w-5" : "h-4 w-4")} />
      <span className={cn(compact && "truncate")}>
        {compact ? (item.shortLabel ?? item.label) : item.label}
      </span>
    </Link>
  );
}

function BottomBar({
  items,
  currentPath,
  trailing,
}: {
  items: DashboardNavItem[];
  currentPath: string;
  trailing?: React.ReactNode;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-md md:hidden">
      <div className="flex items-stretch justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isDashboardNavActive(currentPath, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] sm:text-xs",
                active ? "font-medium text-white" : "text-on-surface-variant",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.shortLabel ?? item.label}</span>
            </Link>
          );
        })}
        {trailing}
      </div>
    </nav>
  );
}

function MobileMenuSheet({
  title,
  items,
  extraItems,
  currentPath,
  open,
  onClose,
}: {
  title: string;
  items: DashboardNavItem[];
  extraItems?: DashboardNavItem[];
  currentPath: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

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
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-on-surface-variant hover:bg-white/5"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              currentPath={currentPath}
              onNavigate={onClose}
            />
          ))}
        </nav>
        {extraItems && extraItems.length > 0 && (
          <>
            <div className="my-4 border-t border-white/10" />
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Como fotografx
            </p>
            <nav className="space-y-1">
              {extraItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  currentPath={currentPath}
                  onNavigate={onClose}
                />
              ))}
            </nav>
          </>
        )}
      </div>
    </div>
  );
}

export function PhotographerMobileNav({ showAdminLink = false }: { showAdminLink?: boolean }) {
  const currentPath = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = showAdminLink || session?.user?.role === "admin";

  if (!isAdmin) {
    return <BottomBar items={photographerNav} currentPath={currentPath} />;
  }

  const primaryItems = photographerNav.filter(
    (item) =>
      item.href === routes.photographer.dashboard ||
      item.href === routes.photographer.events ||
      item.href === routes.photographer.requests,
  );

  const menuItems: DashboardNavItem[] = [
    ...photographerNav.filter(
      (item) =>
        item.href === routes.photographer.profile ||
        item.href === routes.photographer.settings,
    ),
    photographerAdminLink,
    {
      href: routes.client.favorites,
      label: "Mis favoritos",
      shortLabel: "Favoritos",
      icon: Heart,
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-md md:hidden">
        <div className="flex items-stretch justify-around py-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isDashboardNavActive(currentPath, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] sm:text-xs",
                  active ? "font-medium text-white" : "text-on-surface-variant",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.shortLabel ?? item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] sm:text-xs",
              menuOpen ? "font-medium text-white" : "text-on-surface-variant",
            )}
          >
            <Menu className="h-5 w-5 shrink-0" />
            <span className="truncate">Más</span>
          </button>
        </div>
      </nav>

      <MobileMenuSheet
        title="Panel fotografx"
        items={menuItems}
        currentPath={currentPath}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}

export function ClientMobileNav() {
  const currentPath = usePathname();
  return <BottomBar items={clientMobileNav} currentPath={currentPath} />;
}

export function AdminMobileNav() {
  const currentPath = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryItems = adminNav.filter((item) => item.adminMobilePrimary);
  const menuItems = adminNav.filter((item) => !item.adminMobilePrimary);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-md md:hidden">
        <div className="flex items-stretch justify-around py-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isDashboardNavActive(currentPath, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] sm:text-xs",
                  active ? "font-medium text-white" : "text-on-surface-variant",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.shortLabel ?? item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] sm:text-xs",
              menuOpen ? "font-medium text-white" : "text-on-surface-variant",
            )}
          >
            <Menu className="h-5 w-5 shrink-0" />
            <span className="truncate">Más</span>
          </button>
        </div>
      </nav>

      <MobileMenuSheet
        title="Panel admin"
        items={menuItems}
        extraItems={adminPhotographerLinks}
        currentPath={currentPath}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
