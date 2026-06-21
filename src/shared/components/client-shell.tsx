"use client";

import { Suspense } from "react";
import { ClientNav } from "@/shared/components/client-nav";

export function ClientDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl gap-0 px-0 sm:px-6">
      <Suspense fallback={<aside className="hidden w-56 shrink-0 md:block" />}>
        <ClientNav />
      </Suspense>
      <div className="min-w-0 flex-1 px-4 py-8 pb-24 sm:px-0 md:pb-8">{children}</div>
    </div>
  );
}
