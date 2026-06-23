"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import {
  clientMobileNav,
  clientNav,
  isDashboardNavActive,
} from "@/shared/components/dashboard-nav-config";
import { ClientMobileNav } from "@/shared/components/dashboard-mobile-nav";

export function ClientNav() {
  const currentPath = usePathname();

  return (
    <>
      <aside className="hidden w-56 shrink-0 border-r border-white/10 p-4 md:block">
        <div className="mb-6 font-semibold">Mi cuenta</div>
        <nav className="space-y-1">
          {clientNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors",
                isDashboardNavActive(currentPath, href)
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

      <ClientMobileNav />
    </>
  );
}
