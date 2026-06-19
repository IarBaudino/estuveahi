"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Heart } from "lucide-react";
import type { FavoriteWithEvent } from "@/features/favorites/infrastructure/favorite.repository";
import { toggleFavoriteAction } from "@/features/favorites/presentation/actions/favorite.actions";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { formatCurrency } from "@/shared/lib/utils";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { ProtectedImage } from "@/shared/components/protected-image";
import { routes } from "@/config/routes";
import { cn } from "@/shared/lib/utils";

export function FavoriteCard({ photo }: { photo: FavoriteWithEvent }) {
  const router = useRouter();
  const { execute, isExecuting } = useAction(toggleFavoriteAction, {
    onSuccess: () => router.refresh(),
  });

  const photoUrl = photo.eventSlug
    ? routes.eventPhoto(photo.eventSlug, photo.id)
    : routes.events;

  return (
    <div className="group relative overflow-hidden hairline-border bg-surface-container">
      <Link href={photoUrl} className="relative block aspect-square">
        <ProtectedImage
          src={getSecureMediaUrl(photo.id, "thumbnail")}
          alt={photo.originalFilename}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="200px"
        />
        <span className="absolute left-2 top-2 bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white">
          {formatPhotoNumber(photo.sortOrder)}
        </span>
      </Link>

      <div className="space-y-1 p-3">
        <Link
          href={photoUrl}
          className="line-clamp-1 text-sm font-medium hover:underline"
        >
          {photo.eventTitle}
        </Link>
        {photo.priceCents != null && photo.priceCents > 0 && (
          <p className="text-xs text-on-surface-variant">
            {formatCurrency(photo.priceCents, photo.currency)}
          </p>
        )}
      </div>

      <button
        type="button"
        disabled={isExecuting}
        onClick={() => execute({ photoId: photo.id })}
        className={cn(
          "absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80",
          isExecuting && "opacity-50",
        )}
        aria-label="Quitar de favoritos"
      >
        <Heart className="h-4 w-4 fill-current" />
      </button>
    </div>
  );
}
