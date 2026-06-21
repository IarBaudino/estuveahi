"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { PublicPhotographer } from "@/domain/entities/public-photographer";
import { routes } from "@/config/routes";
import { PhotographerAvatar } from "@/features/photographers/presentation/components/photographer-avatar";

interface PhotographerCardProps {
  photographer: PublicPhotographer;
}

export function PhotographerCard({ photographer }: PhotographerCardProps) {
  const { id, displayName, hasAvatar, isVerified, publishedEventCount } = photographer;

  return (
    <Link
      href={routes.photographerPublic(id)}
      className="group block overflow-hidden hairline-border transition-colors hover:bg-white/5"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-container">
        <PhotographerAvatar
          userId={id}
          displayName={displayName}
          hasAvatar={hasAvatar}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {isVerified && (
          <span className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5">
            <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verificado" />
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-headline-md line-clamp-2 text-white">{displayName}</h2>
          <p className="mt-1 text-sm text-white/70">
            {publishedEventCount}{" "}
            {publishedEventCount === 1 ? "evento publicado" : "eventos publicados"}
          </p>
        </div>
      </div>
    </Link>
  );
}
