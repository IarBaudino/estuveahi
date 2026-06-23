"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Camera, Heart, Shield } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import {
  adminNav,
  adminPhotographerLinks,
  isDashboardNavActive,
  photographerNav,
} from "@/shared/components/dashboard-nav-config";

export function DashboardSidebar({
  type,
}: {
  type: "photographer" | "admin";
}) {
  const currentPath = usePathname();
  const { data: session } = useSession();
  const items = type === "photographer" ? photographerNav : adminNav;
  const isAdmin = session?.user?.role === "admin";

  return (
    <aside className="hidden w-56 shrink-0 border-r border-white/10 p-4 md:block">
      <div className="mb-6 flex items-center gap-2 font-semibold">
        <Camera className="h-5 w-5" />
        {type === "photographer" ? PHOTOGRAPHER_LABEL.singularCap : "Admin"}
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors",
                isDashboardNavActive(currentPath, item.href)
                  ? "bg-surface-container-high font-medium"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {type === "photographer" && (
        <div className="mt-6 border-t border-white/10 pt-4">
          {isAdmin && (
            <Link
              href={routes.admin.dashboard}
              className={cn(
                "mb-1 flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors",
                isDashboardNavActive(currentPath, routes.admin.dashboard)
                  ? "bg-surface-container-high font-medium"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              )}
            >
              <Shield className="h-4 w-4" />
              Panel admin
            </Link>
          )}
          <Link
            href={routes.client.favorites}
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          >
            <Heart className="h-4 w-4" />
            Mis favoritos
          </Link>
        </div>
      )}
      {type === "admin" && (
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            Como fotografx
          </p>
          {adminPhotographerLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors",
                  isDashboardNavActive(currentPath, item.href)
                    ? "bg-surface-container-high font-medium"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </aside>
  );
}
