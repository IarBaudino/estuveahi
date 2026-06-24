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
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();

  useGalleryProtection(photos.length > 0);

  function goToLogin() {
    const callback = pathname ? `${pathname}${window.location.search}` : routes.events;
    router.push(`${routes.login}?callbackUrl=${encodeURIComponent(callback)}`);
  }

  function startPurchase(photo: PublicPhoto) {
    if (!isAuthenticated) {
      goToLogin();
      return;
    }
    setPurchasePhoto(photo);
  }

  async function handleToggleFavorite(photoId: string) {
    if (!isAuthenticated) {
      goToLogin();
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
      <p className="mb-4 text-sm text-on-surface-variant">
        Recorré las fotos hasta encontrarte. Cuando veas la tuya, tocá{" "}
        <strong className="text-on-surface">Pedir esta foto</strong>.
      </p>

      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        onContextMenu={(e) => e.preventDefault()}
      >
        {photos.map((photo) => (
          <article
            key={photo.id}
            className="overflow-hidden rounded-xl border border-white/10 bg-surface-container"
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className="group relative block aspect-square w-full overflow-hidden bg-zinc-900"
              aria-label={`Ver foto ${formatPhotoNumber(photo.sortOrder)} en grande`}
            >
              <ProtectedImage
                src={getSecureMediaUrl(photo.id, "thumbnail")}
                alt={`Foto ${formatPhotoNumber(photo.sortOrder)}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <span className="absolute left-2 top-2 z-20 rounded bg-black/70 px-2 py-0.5 font-mono text-xs text-white">
                {formatPhotoNumber(photo.sortOrder)}
              </span>
              {photo.priceCents != null && photo.priceCents > 0 && (
                <span className="absolute right-2 top-2 z-20 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                  {formatCurrency(photo.priceCents, photo.currency)}
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                Ver en grande
              </span>
            </button>

            <div className="flex items-center gap-2 p-3">
              <Button
                type="button"
                size="sm"
                className="min-h-10 flex-1 gap-1.5 text-sm"
                onClick={() => startPurchase(photo)}
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />
                Pedir esta foto
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-10 shrink-0 px-3"
                onClick={() => handleToggleFavorite(photo.id)}
                aria-label={
                  favorites.has(photo.id) ? "Quitar de favoritos" : "Agregar a favoritos"
                }
              >
                <Heart
                  className={`h-4 w-4 ${favorites.has(photo.id) ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
            </div>
          </article>
        ))}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/95"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="flex shrink-0 items-center justify-end p-3 sm:p-4">
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="rounded-full p-2 text-white transition-colors hover:bg-white/10 hover:text-zinc-200"
                aria-label="Cerrar vista ampliada"
              >
                <X className="h-7 w-7 sm:h-8 sm:w-8" />
              </button>
            </div>

            <div
              className="flex min-h-0 flex-1 items-center justify-center px-3 sm:px-6"
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                initial={{ scale: 0.97 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.97 }}
                className="flex max-h-full max-w-full items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <ProtectedImage
                  src={getSecureMediaUrl(selectedPhoto.id, "preview")}
                  alt="Vista previa"
                  width={selectedPhoto.width ?? 960}
                  height={selectedPhoto.height ?? 720}
                  className="max-h-[calc(100dvh-13rem)] w-auto max-w-[min(100vw-1.5rem,64rem)] rounded-lg object-contain"
                  sizes="(max-width: 1024px) 100vw, 64rem"
                  priority
                />
              </motion.div>
            </div>

            <div
              className="shrink-0 border-t border-white/10 px-4 py-4 sm:px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-zinc-300">
                    Foto {formatPhotoNumber(selectedPhoto.sortOrder)}
                  </p>
                  {selectedPhoto.priceCents != null && selectedPhoto.priceCents > 0 && (
                    <p className="text-zinc-400">
                      {formatCurrency(selectedPhoto.priceCents, selectedPhoto.currency)}
                    </p>
                  )}
                  <p className="text-caption text-on-surface-variant/60">
                    Vista previa con marca de agua
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      startPurchase(selectedPhoto);
                      setSelectedPhoto(null);
                    }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Pedir esta foto
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto"
                    onClick={() => handleToggleFavorite(selectedPhoto.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${favorites.has(selectedPhoto.id) ? "fill-red-500 text-red-500" : ""}`}
                    />
                    Favorito
                  </Button>
                </div>
              </div>
            </div>
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
