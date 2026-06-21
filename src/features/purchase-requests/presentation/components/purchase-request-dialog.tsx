"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { businessConfig } from "@/config/business";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { formatCurrency } from "@/shared/lib/utils";
import { routes } from "@/config/routes";
import { createPurchaseRequestAction } from "../actions/purchase-request.actions";
import { X } from "lucide-react";

interface PurchaseRequestDialogProps {
  photoId: string;
  photoNumber: number;
  photoPriceCents: number | null;
  onClose: () => void;
}

export function PurchaseRequestDialog({
  photoId,
  photoNumber,
  photoPriceCents,
  onClose,
}: PurchaseRequestDialogProps) {
  const [message, setMessage] = useState("");
  const { execute, isExecuting, result } = useAction(createPurchaseRequestAction);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    execute({ photoId, message: message || undefined });
  }

  if (result.data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-md hairline-border bg-surface-container p-6">
          <h3 className="text-headline-md">¡Pedido enviado!</h3>
          <p className="mt-2 text-sm text-on-surface-variant">
            Foto {formatPhotoNumber(photoNumber)} — el fotógrafo recibió tu solicitud con tus
            datos de contacto. Coordiná el pago y la entrega en alta directamente con él o ella.
          </p>
          <Button className="mt-4 w-full" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  const profileIncomplete =
    result.serverError?.includes("Completá tu perfil");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md hairline-border bg-surface-container p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-md">Pedir foto {formatPhotoNumber(photoNumber)}</h3>
          <button type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {photoPriceCents != null && photoPriceCents > 0 && (
          <p className="mt-2 font-medium">
            Precio publicado: {formatCurrency(photoPriceCents, "ARS")}
          </p>
        )}
        <p className="mt-2 text-sm text-on-surface-variant">
          {businessConfig.deliveryDescription}
        </p>
        {profileIncomplete && (
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <p>Antes de pedir una foto necesitás completar tu perfil.</p>
            <Link href={routes.client.profile} className="mt-2 inline-block font-medium underline">
              Ir a mi perfil
            </Link>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Textarea
            label="Mensaje al fotógrafo (opcional)"
            placeholder="Ej: cómo preferís recibir la foto..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
          {result.serverError && !profileIncomplete && (
            <p className="text-sm text-red-500">{result.serverError}</p>
          )}
          <Button type="submit" className="w-full" isLoading={isExecuting}>
            Enviar pedido
          </Button>
        </form>
      </div>
    </div>
  );
}
