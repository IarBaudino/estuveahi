"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import {
  Calendar,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { routes } from "@/config/routes";

const items = [
  { href: routes.photographer.dashboard, label: "Inicio", icon: LayoutDashboard },
  { href: routes.photographer.events, label: "Eventos", icon: Calendar },
  { href: routes.photographer.requests, label: "Ventas", icon: ShoppingBag },
  { href: routes.photographer.profile, label: "Perfil", icon: Settings },
  { href: routes.photographer.settings, label: "Ajustes", icon: SlidersHorizontal },
];

export function MobileDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-md md:hidden">
      <div className="flex justify-around py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === routes.photographer.dashboard
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
                active ? "font-medium text-white" : "text-on-surface-variant",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
