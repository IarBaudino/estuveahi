"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { PHOTOGRAPHER_LABEL } from "@/config/copy";
import { businessConfig } from "@/config/business";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { formatCurrency } from "@/shared/lib/utils";
import { routes } from "@/config/routes";
import { createPurchaseRequestAction } from "../actions/purchase-request.actions";

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
  const [submitted, setSubmitted] = useState(false);

  const { executeAsync, isExecuting, result } = useAction(createPurchaseRequestAction);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const response = await executeAsync({ photoId, message: message || undefined });

    if (response?.data?.success) {
      setSubmitted(true);
      return;
    }

    if (response?.validationErrors) {
      console.error("[PurchaseRequestDialog] validation:", response.validationErrors);
    }
  }

  if (submitted) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        role="dialog"
        aria-labelledby="purchase-success-title"
        aria-modal="true"
      >
        <div className="w-full max-w-md hairline-border bg-surface-container p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" aria-hidden />
          <h3 id="purchase-success-title" className="text-headline-md mt-4">
            ¡Pedido enviado!
          </h3>
          <p className="mt-3 text-sm text-on-surface-variant">
            Foto {formatPhotoNumber(photoNumber)} — la {PHOTOGRAPHER_LABEL.singular} recibió tu
            pedido con tus datos de contacto y se pondrá en contacto en breve para coordinar el
            pago y la entrega en alta.
          </p>
          <p className="mt-2 text-xs text-on-surface-variant/80">
            {businessConfig.deliveryDescription}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={onClose}>
              Entendido
            </Button>
            <Link
              href={routes.client.requests}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 border border-white/20 bg-transparent px-4 text-label-sm font-medium uppercase tracking-widest text-primary transition-all hover:bg-white/5"
              onClick={onClose}
            >
              Ver mis pedidos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const profileIncomplete =
    result?.serverError?.includes("Completá tu perfil");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-labelledby="purchase-dialog-title"
      aria-modal="true"
    >
      <div className="w-full max-w-md hairline-border bg-surface-container p-6">
        <div className="flex items-center justify-between">
          <h3 id="purchase-dialog-title" className="text-headline-md">
            Pedir foto {formatPhotoNumber(photoNumber)}
          </h3>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>
        {photoPriceCents != null && photoPriceCents > 0 && (
          <p className="mt-2 font-medium">
            Precio publicado: {formatCurrency(photoPriceCents, "ARS")}
          </p>
        )}
        <p className="mt-2 text-sm text-on-surface-variant">
          Enviá tu pedido y la {PHOTOGRAPHER_LABEL.singular} te contactará para cerrar el trato.
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
            label="Mensaje a la fotografx (opcional)"
            placeholder="Ej: cómo preferís recibir la foto..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
          {result?.serverError && !profileIncomplete && (
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
