"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { Calendar, Camera, Heart, Home, ShoppingBag, User } from "lucide-react";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";

const items = [
  { href: routes.client.dashboard, label: "Inicio", icon: Home },
  { href: routes.events, label: "Eventos", icon: Calendar },
  { href: routes.photographers, label: PHOTOGRAPHER_LABEL.pluralCap, icon: Camera },
  { href: routes.client.favorites, label: "Favoritos", icon: Heart },
  { href: routes.client.requests, label: "Solicitudes", icon: ShoppingBag },
  { href: routes.client.profile, label: "Mi perfil", icon: User },
];

function isActive(currentPath: string, href: string) {
  if (href === routes.client.dashboard) {
    return currentPath === href;
  }
  if (href === routes.events) {
    return currentPath === href || currentPath.startsWith("/eventos/");
  }
  if (href === routes.photographers) {
    return currentPath === href || currentPath.startsWith("/fotografxs/");
  }
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function ClientNav() {
  const currentPath = usePathname();
  const mobileItems = items.filter(
    (item) =>
      item.href === routes.client.dashboard ||
      item.href === routes.events ||
      item.href === routes.client.favorites ||
      item.href === routes.client.profile,
  );

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-white/10 p-4 md:block">
        <div className="mb-6 font-semibold">Mi cuenta</div>
        <nav className="space-y-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors",
                isActive(currentPath, href)
                  ? "bg-surface-container-high font-medium"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-md md:hidden">
        <div className="flex justify-around py-2">
          {mobileItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs",
                isActive(currentPath, href) ? "font-medium text-white" : "text-on-surface-variant",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
