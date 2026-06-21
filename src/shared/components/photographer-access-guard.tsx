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
  const isOnboarding = pathname.startsWith(routes.photographer.onboarding);

  useEffect(() => {
    if (isPending && !isDashboard && !isOnboarding) {
      router.replace(routes.photographer.dashboard);
    }
  }, [isPending, isDashboard, isOnboarding, router]);

  if (isPending && !isDashboard && !isOnboarding) {
    return null;
  }

  return children;
}
