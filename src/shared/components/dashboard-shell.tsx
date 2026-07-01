"use client";

import { Suspense } from "react";
import { DashboardSidebar } from "@/shared/components/dashboard-sidebar";
import {
  AdminMobileNav,
  PhotographerMobileNav,
} from "@/shared/components/dashboard-mobile-nav";
import { PhotographerAccessGuard } from "@/shared/components/photographer-access-guard";

function SidebarFallback() {
  return <aside className="hidden w-56 shrink-0 border-r border-white/10 p-4 md:block" />;
}

export function PhotographerDashboardShell({
  isPending,
  isAdmin = false,
  children,
}: {
  isPending: boolean;
  isAdmin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <PhotographerAccessGuard isPending={isPending}>
      <div className="mx-auto flex max-w-7xl gap-0 px-0 sm:px-6">
        <Suspense fallback={<SidebarFallback />}>
          <DashboardSidebar type="photographer" showAdminLink={isAdmin} />
        </Suspense>
        <div className="min-w-0 flex-1 px-4 py-8 pb-24 sm:px-0 md:pb-8">{children}</div>
        <Suspense fallback={null}>
          <PhotographerMobileNav showAdminLink={isAdmin} />
        </Suspense>
      </div>
    </PhotographerAccessGuard>
  );
}

export function AdminDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl gap-0 px-0 sm:px-6">
      <Suspense fallback={<SidebarFallback />}>
        <DashboardSidebar type="admin" />
      </Suspense>
      <div className="min-w-0 flex-1 px-4 py-8 pb-24 sm:px-0 md:pb-8">{children}</div>
      <Suspense fallback={null}>
        <AdminMobileNav />
      </Suspense>
    </div>
  );
}
