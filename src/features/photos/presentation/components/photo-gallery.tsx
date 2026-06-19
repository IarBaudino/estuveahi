"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X } from "lucide-react";
import type { PublicPhoto } from "@/domain/dto/public-photo";
import { formatCurrency } from "@/shared/lib/utils";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { Button } from "@/shared/ui/button";
import { ProtectedImage } from "@/shared/components/protected-image";
import { useGalleryProtection } from "@/shared/hooks/use-gallery-protection";
import { toggleFavoriteAction } from "@/features/favorites/presentation/actions/favorite.actions";
import { PurchaseRequestDialog } from "@/features/purchase-requests/presentation/components/purchase-request-dialog";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";

interface PhotoGalleryProps {
  photos: PublicPhoto[];
  favoriteIds: string[];
  isAuthenticated: boolean;
}

export function PhotoGallery({
  photos,
  favoriteIds: initialFavorites,
  isAuthenticated,
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PublicPhoto | null>(null);
  const [favorites, setFavorites] = useState(new Set(initialFavorites));
  const [purchasePhoto, setPurchasePhoto] = useState<PublicPhoto | null>(null);
  const router = useRouter();

  useGalleryProtection(photos.length > 0);

  async function handleToggleFavorite(photoId: string) {
    if (!isAuthenticated) {
      router.push(routes.login);
      return;
    }
    const result = await toggleFavoriteAction({ photoId });
    if (result?.data) {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (result.data!.favorited) next.add(photoId);
        else next.delete(photoId);
        return next;
      });
    }
  }

  if (photos.length === 0) {
    return (
      <p className="py-12 text-center text-on-surface-variant">
        Este evento aún no tiene fotografías publicadas.
      </p>
    );
  }

  return (
    <>
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-4 lg:grid-cols-4"
        onContextMenu={(e) => e.preventDefault()}
      >
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedPhoto(photo)}
            className="group relative aspect-square overflow-hidden bg-surface-container"
          >
            <ProtectedImage
              src={getSecureMediaUrl(photo.id, "thumbnail")}
              alt="Fotografía de evento"
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <span className="absolute left-2 top-2 z-20 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">
              {formatPhotoNumber(photo.sortOrder)}
            </span>
            {photo.priceCents && (
              <span className="absolute bottom-2 right-2 z-20 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                {formatCurrency(photo.priceCents, photo.currency)}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setSelectedPhoto(null)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-h-[90vh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-12 right-0 text-white hover:text-zinc-300"
              >
                <X className="h-8 w-8" />
              </button>
              <div className="relative aspect-[4/3] w-full max-w-5xl overflow-hidden rounded-lg">
                <ProtectedImage
                  src={getSecureMediaUrl(selectedPhoto.id, "preview")}
                  alt="Vista previa"
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-zinc-300">
                    Foto {formatPhotoNumber(selectedPhoto.sortOrder)}
                  </p>
                  {selectedPhoto.priceCents && (
                    <p className="text-zinc-400">
                      {formatCurrency(selectedPhoto.priceCents, selectedPhoto.currency)}
                    </p>
                  )}
                  <p className="text-caption text-on-surface-variant/60">
                    Vista previa con marca de agua · el fotógrafo envía el original en alta tras el acuerdo
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => handleToggleFavorite(selectedPhoto.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${favorites.has(selectedPhoto.id) ? "fill-red-500 text-red-500" : ""}`}
                    />
                    Favorito
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!isAuthenticated) {
                        router.push(routes.login);
                        return;
                      }
                      setPurchasePhoto(selectedPhoto);
                      setSelectedPhoto(null);
                    }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Solicitar compra
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {purchasePhoto && (
        <PurchaseRequestDialog
          photoId={purchasePhoto.id}
          photoNumber={purchasePhoto.sortOrder}
          photoPriceCents={purchasePhoto.priceCents}
          onClose={() => setPurchasePhoto(null)}
        />
      )}
    </>
  );
}
