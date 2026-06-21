"use client";

import { useEffect } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";

export default function PhotographerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PhotographerError]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <h1 className="text-xl font-bold">No se pudo cargar el panel</h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        Hubo un error al cargar el {PHOTOGRAPHER_LABEL.panel.toLowerCase()}. Probá recargar o volver a iniciar sesión.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-primary px-4 py-2 text-sm font-medium text-background"
        >
          Reintentar
        </button>
        <Link href={routes.login} className="border border-white/20 px-4 py-2 text-sm">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
