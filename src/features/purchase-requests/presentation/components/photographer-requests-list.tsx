"use client";

import { useMemo, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import type { PurchaseRequestRow } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  PURCHASE_REQUEST_STATUS_LABELS,
  PURCHASE_REQUEST_STATUS_HINTS,
} from "@/domain/enums/purchase-request-status";
import { businessConfig } from "@/config/business";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { getDisplayName } from "@/shared/lib/profile";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { formatCurrency } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";
import { ProtectedImage } from "@/shared/components/protected-image";
import {
  approvePurchaseRequestAction,
  archivePurchaseRequestAction,
  completePurchaseRequestAction,
  deletePurchaseRequestAction,
  rejectPurchaseRequestAction,
  unarchivePurchaseRequestAction,
} from "@/features/purchase-requests/presentation/actions/purchase-request.actions";

type ViewFilter = "active" | "archived";

export function PhotographerRequestsList({
  requests,
}: {
  requests: PurchaseRequestRow[];
}) {
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [view, setView] = useState<ViewFilter>("active");

  const refresh = () => router.refresh();
  const actionOpts = { onSuccess: refresh };

  const { execute: approve, isExecuting: approving } = useAction(
    approvePurchaseRequestAction,
    actionOpts,
  );
  const { execute: reject } = useAction(rejectPurchaseRequestAction, actionOpts);
  const { execute: complete } = useAction(completePurchaseRequestAction, actionOpts);
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

  const activeCount = useMemo(
    () => requests.filter((req) => !req.photographer_archived_at).length,
    [requests],
  );
  const archivedCount = useMemo(
    () => requests.filter((req) => req.photographer_archived_at).length,
    [requests],
  );

  const visibleRequests = useMemo(
    () =>
      requests.filter((req) =>
        view === "active" ? !req.photographer_archived_at : Boolean(req.photographer_archived_at),
      ),
    [requests, view],
  );

  function confirmDelete() {
    return confirm(
      "¿Eliminar este pedido de forma permanente? El cliente ya no lo verá en su cuenta.",
    );
  }

  if (requests.length === 0) {
    return <p className="text-on-surface-variant">No hay pedidos de compra.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setView("active")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm transition-colors",
            view === "active"
              ? "bg-surface-container-high font-medium"
              : "text-on-surface-variant hover:bg-surface-container",
          )}
        >
          Activos ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setView("archived")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm transition-colors",
            view === "archived"
              ? "bg-surface-container-high font-medium"
              : "text-on-surface-variant hover:bg-surface-container",
          )}
        >
          Ocultos ({archivedCount})
        </button>
      </div>

      <p className="text-caption text-on-surface-variant/80">
        {view === "active"
          ? "Ocultá pedidos de prueba para limpiar la lista. El cliente sigue viendo su solicitud."
          : "Pedidos ocultos del panel. Podés restaurarlos o eliminarlos definitivamente."}
      </p>

      {visibleRequests.length === 0 ? (
        <p className="text-on-surface-variant">
          {view === "active" ? "No tenés pedidos activos." : "No tenés pedidos ocultos."}
        </p>
      ) : (
        visibleRequests.map((req) => {
          const hint = PURCHASE_REQUEST_STATUS_HINTS[req.status]?.photographer;
          const client = req.clients;
          const clientName = client
            ? getDisplayName({
                firstName: client.first_name,
                lastName: client.last_name,
                email: client.email,
                phone: client.phone,
              })
            : "Cliente";
          const isArchived = Boolean(req.photographer_archived_at);

          return (
            <div
              key={req.id}
              className="flex flex-wrap gap-4 hairline-border p-4"
            >
              {req.photos && (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden">
                  <ProtectedImage
                    src={getSecureMediaUrl(req.photos.id, "thumbnail")}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  <span className="absolute left-0 top-0 bg-black/70 px-1 py-0.5 font-mono text-[9px] text-white">
                    {formatPhotoNumber(req.photos.sort_order)}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{PURCHASE_REQUEST_STATUS_LABELS[req.status]}</Badge>
                  {isArchived && <Badge variant="outline">Oculto</Badge>}
                  {req.photos && (
                    <span className="font-mono text-sm">
                      Foto {formatPhotoNumber(req.photos.sort_order)}
                    </span>
                  )}
                  <span className="text-sm text-on-surface-variant">
                    {req.events?.title}
                  </span>
                </div>

                <div className="mt-2 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
                  <p className="font-medium">{clientName}</p>
                  {client?.email && (
                    <p className="text-on-surface-variant">{client.email}</p>
                  )}
                  {client?.phone && (
                    <p className="text-on-surface-variant">{client.phone}</p>
                  )}
                </div>

                {req.message && (
                  <p className="mt-2 text-sm text-on-surface-variant">
                    &quot;{req.message}&quot;
                  </p>
                )}
                {req.quoted_price_cents != null && req.quoted_price_cents > 0 && (
                  <p className="mt-2 font-medium">
                    {formatCurrency(req.quoted_price_cents, req.currency)}
                    <span className="text-caption ml-2 text-on-surface-variant/70">
                      (100 % para vos)
                    </span>
                  </p>
                )}
                {hint && (
                  <p className="text-caption mt-2 text-on-surface-variant/80">
                    {hint}
                  </p>
                )}
              </div>
              <div className="flex w-full flex-wrap items-end gap-2 sm:w-auto sm:justify-end">
                {!isArchived && req.status === "pending" && (
                  <>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="Precio en pesos"
                      className="w-40"
                      value={prices[req.id] ?? ""}
                      onChange={(e) =>
                        setPrices((p) => ({ ...p, [req.id]: e.target.value }))
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const pesos = Number(prices[req.id] ?? 0);
                        if (pesos <= 0) return;
                        approve({
                          requestId: req.id,
                          quotedPriceCents: Math.round(pesos * 100),
                        });
                      }}
                      isLoading={approving}
                    >
                      Enviar cotización
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reject({ requestId: req.id })}
                    >
                      Rechazar
                    </Button>
                  </>
                )}
                {!isArchived && req.status === "approved" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      if (
                        confirm(
                          "¿Ya cobraste y enviaste la imagen en alta al cliente?",
                        )
                      ) {
                        complete({ requestId: req.id });
                      }
                    }}
                  >
                    Marcar como entregada
                  </Button>
                )}

                {!isArchived && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => archive({ requestId: req.id })}
                    isLoading={archiving}
                  >
                    <Archive className="h-4 w-4" />
                    Ocultar
                  </Button>
                )}

                {isArchived && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => unarchive({ requestId: req.id })}
                      isLoading={unarchiving}
                    >
                      <ArchiveRestore className="h-4 w-4" />
                      Mostrar de nuevo
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirmDelete()) {
                          remove({ requestId: req.id });
                        }
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
                    size="sm"
                    variant="ghost"
                    className="text-on-surface-variant"
                    onClick={() => {
                      if (confirmDelete()) {
                        remove({ requestId: req.id });
                      }
                    }}
                    isLoading={removing}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}

      <p className="text-caption text-on-surface-variant/70">
        {businessConfig.noPlatformFeeMessage} {businessConfig.deliveryDescription}
      </p>
    </div>
  );
}
