"use client";

import { useEffect } from "react";

/**
 * Desactiva atajos comunes de guardado/copia en el contenedor de galería.
 * No impide capturas de pantalla — solo añade fricción para usuarios casuales.
 */
export function useGalleryProtection(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const handler = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "s" || e.key === "p" || e.key === "c" || e.key === "u")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [active]);
}
