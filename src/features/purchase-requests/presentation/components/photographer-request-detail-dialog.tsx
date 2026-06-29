"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { Archive, ArchiveRestore, Mail, Phone, Trash2, User, X } from "lucide-react";
import type { PurchaseRequestRow } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  PURCHASE_REQUEST_STATUS_LABELS,
  PURCHASE_REQUEST_STATUS_HINTS,
  getPurchaseRequestStatusBadgeVariant,
} from "@/domain/enums/purchase-request-status";
import { businessConfig } from "@/config/business";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { getDisplayName } from "@/shared/lib/profile";
import { getAvatarMediaUrl } from "@/shared/lib/avatar-url";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { formatCurrency } from "@/shared/lib/utils";
import { ProtectedImage } from "@/shared/components/protected-image";
import { WhatsAppContactButton } from "@/features/purchase-requests/presentation/components/whatsapp-contact-button";
import { buildPurchaseRequestWhatsAppMessage } from "@/features/purchase-requests/presentation/lib/purchase-request-whatsapp";
import {
  approvePurchaseRequestAction,
  archivePurchaseRequestAction,
  completePurchaseRequestAction,
  deletePurchaseRequestAction,
  rejectPurchaseRequestAction,
  unarchivePurchaseRequestAction,
} from "@/features/purchase-requests/presentation/actions/purchase-request.actions";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

interface PhotographerRequestDetailDialogProps {
  request: PurchaseRequestRow;
  onClose: () => void;
  onUpdated: () => void;
}

export function PhotographerRequestDetailDialog({
  request,
  onClose,
  onUpdated,
}: PhotographerRequestDetailDialogProps) {
  const [pricePesos, setPricePesos] = useState(() =>
    request.quoted_price_cents != null && request.quoted_price_cents > 0
      ? String(request.quoted_price_cents / 100)
      : "",
  );
  const actionOpts = { onSuccess: onUpdated };

  const { execute: approve, isExecuting: approving } = useAction(
    approvePurchaseRequestAction,
    actionOpts,
  );
  const { execute: reject, isExecuting: rejecting } = useAction(
    rejectPurchaseRequestAction,
    actionOpts,
  );
  const { execute: complete, isExecuting: completing } = useAction(
    completePurchaseRequestAction,
    actionOpts,
  );
  const { execute: archive, isExecuting: archiving } = useAction(
    archivePurchaseRequestAction,
    actionOpts,
  );
  const { execute: unarchive, isExecuting: unarchiving } = useAction(
    unarchivePurchaseRequestAction,
    actionOpts,
  );
  const { execute: remove, isExecuting: removing } = useAction(
    deletePurchaseRequestAction,
    actionOpts,
  );

  const client = request.clients;
  const clientName = client
    ? getDisplayName({
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email,
        phone: client.phone,
      })
    : "Cliente";
  const hint = PURCHASE_REQUEST_STATUS_HINTS[request.status]?.photographer;
  const isArchived = Boolean(request.photographer_archived_at);
  const hasListedQuote =
    request.quoted_price_cents != null && request.quoted_price_cents > 0;

  function resolveQuotedPriceCents(): number | null {
    if (pricePesos.trim()) {
      const pesos = Number(pricePesos);
      if (pesos > 0) return Math.round(pesos * 100);
    }
    if (hasListedQuote) return request.quoted_price_cents;
    return null;
  }

  function handleApprove() {
    const quotedPriceCents = resolveQuotedPriceCents();
    if (quotedPriceCents == null || quotedPriceCents <= 0) return;
    approve({ requestId: request.id, quotedPriceCents });
  }

  function confirmDelete() {
    return confirm(
      "¿Eliminar este pedido de forma permanente? El cliente ya no lo verá en su cuenta.",
    );
  }

  const whatsappMessage = buildPurchaseRequestWhatsAppMessage({
    clientFirstName: client?.first_name,
    eventTitle: request.events?.title ?? "el evento",
    photoSortOrder: request.photos?.sort_order,
    quotedPriceCents: request.quoted_price_cents,
    currency: request.currency,
    clientMessage: request.message,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-labelledby="request-detail-title"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(100dvh,48rem)] w-full max-w-2xl flex-col overflow-hidden hairline-border bg-surface-container sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
          <div>
            <h2 id="request-detail-title" className="text-headline-md">
              Pedido de foto
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {request.events?.title ?? "Evento"}
              {request.photos && ` · Foto ${formatPhotoNumber(request.photos.sort_order)}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getPurchaseRequestStatusBadgeVariant(request.status)}>
              {PURCHASE_REQUEST_STATUS_LABELS[request.status]}
            </Badge>
            {isArchived && <Badge variant="outline">Oculto</Badge>}
            <span className="text-caption text-on-surface-variant">
              Pedido del {formatDateTime(request.created_at)}
            </span>
          </div>

          {request.photos && (
            <div className="flex items-start gap-4">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                <ProtectedImage
                  src={getSecureMediaUrl(request.photos.id, "preview")}
                  alt=""
                  fill
                  className="object-cover"
                />
                <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white">
                  {formatPhotoNumber(request.photos.sort_order)}
                </span>
              </div>
              <div className="min-w-0 text-sm">
                <p className="font-medium">{request.events?.title}</p>
                <p className="text-on-surface-variant">{request.photos.original_filename}</p>
                {request.photos.price_cents != null && request.photos.price_cents > 0 && (
                  <p className="mt-1">
                    Precio en galería:{" "}
                    {formatCurrency(request.photos.price_cents, request.currency)}
                  </p>
                )}
              </div>
            </div>
          )}

          <section className="rounded-xl border border-white/10 bg-surface-container-high p-4">
            <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Datos del comprador
            </h3>
            <div className="mt-4 flex items-start gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-800">
                {client ? (
                  <ProtectedImage
                    src={getAvatarMediaUrl(client.id)}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-zinc-500" />
                )}
              </div>
              <div className="min-w-0 space-y-2 text-sm">
                <p className="text-base font-semibold">{clientName}</p>
                {client?.full_name &&
                  client.full_name.trim() !== clientName && (
                    <p className="text-on-surface-variant">{client.full_name}</p>
                  )}
                {client?.email && (
                  <p className="flex items-center gap-2 break-all text-on-surface-variant">
                    <Mail className="h-4 w-4 shrink-0" />
                    <a href={`mailto:${client.email}`} className="hover:underline">
                      {client.email}
                    </a>
                  </p>
                )}
                {client?.phone && (
                  <p className="flex items-center gap-2 text-on-surface-variant">
                    <Phone className="h-4 w-4 shrink-0" />
                    <a href={`tel:${client.phone}`} className="hover:underline">
                      {client.phone}
                    </a>
                  </p>
                )}
                {!client && (
                  <p className="text-on-surface-variant">
                    No pudimos cargar los datos de contacto del cliente.
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <WhatsAppContactButton phone={client?.phone} message={whatsappMessage} />
            </div>
          </section>

          {request.message && (
            <section>
              <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
                Mensaje del cliente
              </h3>
              <p className="mt-2 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
                &quot;{request.message}&quot;
              </p>
            </section>
          )}

          {request.quoted_price_cents != null && request.quoted_price_cents > 0 && (
            <p className="font-medium">
              {request.status === "pending" ? "Precio publicado: " : "Cotización: "}
              {formatCurrency(request.quoted_price_cents, request.currency)}
              {request.status !== "pending" && (
                <span className="text-caption ml-2 text-on-surface-variant/70">
                  (100 % para vos)
                </span>
              )}
            </p>
          )}

          {hint && <p className="text-caption text-on-surface-variant/80">{hint}</p>}
        </div>

        <div className="shrink-0 space-y-3 border-t border-white/10 px-4 py-4 sm:px-6">
          {!isArchived && request.status === "pending" && (
            <div className="space-y-2">
              {hasListedQuote && (
                <p className="text-caption text-on-surface-variant">
                  El cliente pidió la foto al precio publicado. Podés aceptarlo o modificarlo.
                </p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder={hasListedQuote ? "Precio en pesos (opcional)" : "Precio en pesos"}
                  className="sm:flex-1"
                  value={pricePesos}
                  onChange={(e) => setPricePesos(e.target.value)}
                />
                <Button onClick={handleApprove} isLoading={approving}>
                  {hasListedQuote ? "Aceptar pedido" : "Enviar cotización"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => reject({ requestId: request.id })}
                  isLoading={rejecting}
                >
                  Rechazar
                </Button>
              </div>
            </div>
          )}

          {!isArchived && request.status === "approved" && (
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                if (confirm("¿Ya cobraste y enviaste la imagen en alta al cliente?")) {
                  complete({ requestId: request.id });
                }
              }}
              isLoading={completing}
            >
              Marcar como entregada
            </Button>
          )}

          <div className="flex flex-wrap gap-2">
            {!isArchived && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => archive({ requestId: request.id })}
                isLoading={archiving}
              >
                <Archive className="h-4 w-4" />
                Ocultar
              </Button>
            )}

            {isArchived && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unarchive({ requestId: request.id })}
                  isLoading={unarchiving}
                >
                  <ArchiveRestore className="h-4 w-4" />
                  Mostrar de nuevo
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirmDelete()) remove({ requestId: request.id });
                  }}
                  isLoading={removing}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </>
            )}

            {!isArchived && (
              <Button
                variant="ghost"
                size="sm"
                className="text-on-surface-variant"
                onClick={() => {
                  if (confirmDelete()) remove({ requestId: request.id });
                }}
                isLoading={removing}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            )}
          </div>

          <p className="text-caption text-on-surface-variant/70">
            {businessConfig.noPlatformFeeMessage} {businessConfig.photographerDeliveryNote}
          </p>
        </div>
      </div>
    </div>
  );
}
