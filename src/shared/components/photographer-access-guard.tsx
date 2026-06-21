"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { routes } from "@/config/routes";

export function PhotographerAccessGuard({
  isPending,
  children,
}: {
  isPending: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === routes.photographer.dashboard;

  useEffect(() => {
    if (isPending && !isDashboard) {
      router.replace(routes.photographer.dashboard);
    }
  }, [isPending, isDashboard, router]);

  if (isPending && !isDashboard) {
    return null;
  }

  return children;
}
