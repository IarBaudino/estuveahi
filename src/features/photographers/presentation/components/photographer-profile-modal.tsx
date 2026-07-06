"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { PublicPhotographer } from "@/domain/entities/public-photographer";
import { PhotographerPublicProfile } from "@/features/photographers/presentation/components/photographer-public-profile";

interface PhotographerProfileModalProps {
  photographer: PublicPhotographer;
  onClose: () => void;
}

export function PhotographerProfileModal({
  photographer,
  onClose,
}: PhotographerProfileModalProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4"
      role="dialog"
      aria-labelledby="photographer-profile-title"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative flex w-fit max-h-[calc(100dvh-1.5rem)] min-h-0 min-w-0 max-w-[min(64rem,calc(100vw-1.5rem))] flex-col overflow-hidden hairline-border bg-surface-container sm:max-h-[calc(100dvh-2rem)] sm:min-h-[min(72dvh,520px)] sm:max-w-5xl sm:rounded-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="photographer-profile-title" className="sr-only">
          {photographer.displayName}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-full bg-black/40 p-1.5 text-on-surface-variant backdrop-blur-sm transition-colors hover:bg-black/60"
          aria-label="Cerrar perfil"
        >
          <X className="h-4 w-4" />
        </button>

        <PhotographerPublicProfile photographer={photographer} variant="modal" />
      </div>
    </div>
  );
}
