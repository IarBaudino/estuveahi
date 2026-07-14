"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore } from "lucide-react";
import type { PurchaseRequestRow } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  PURCHASE_REQUEST_STATUS_LABELS,
  PURCHASE_REQUEST_STATUS_HINTS,
  getPurchaseRequestStatusBadgeVariant,
} from "@/domain/enums/purchase-request-status";
import { businessConfig } from "@/config/business";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { formatCurrency } from "@/shared/lib/utils";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { ProtectedImage } from "@/shared/components/protected-image";
import {
  archiveClientPurchaseRequestAction,
  cancelPurchaseRequestAction,
  unarchiveClientPurchaseRequestAction,
} from "@/features/purchase-requests/presentation/actions/purchase-request.actions";
import { routes } from "@/config/routes";
import { cn } from "@/shared/lib/utils";
import { actionFeedback } from "@/shared/lib/action-feedback";
import { toastMessages } from "@/shared/lib/toast-messages";

type ViewFilter = "active" | "archived";

export function ClientRequestsList({ requests }: { requests: PurchaseRequestRow[] }) {
  const router = useRouter();
  const [view, setView] = useState<ViewFilter>("active");

  const refresh = () => router.refresh();
  const actionOpts = actionFeedback({
    successMessage: toastMessages.statusUpdated,
    onSuccess: refresh,
  });

  const { execute: cancel } = useAction(cancelPurchaseRequestAction, actionOpts);
  const { execute: archive, isExecuting: archiving } = useAction(
    archiveClientPurchaseRequestAction,
    actionOpts,
  );
  const { execute: unarchive, isExecuting: unarchiving } = useAction(
    unarchiveClientPurchaseRequestAction,
    actionOpts,
  );

  const activeCount = useMemo(
    () => requests.filter((req) => !req.client_archived_at).length,
    [requests],
  );
  const archivedCount = useMemo(
    () => requests.filter((req) => req.client_archived_at).length,
    [requests],
  );

  const visibleRequests = useMemo(
    () =>
      requests.filter((req) =>
        view === "active" ? !req.client_archived_at : Boolean(req.client_archived_at),
      ),
    [requests, view],
  );

  if (requests.length === 0) {
    return (
      <div className="text-center">
        <p className="text-on-surface-variant">No tenés solicitudes de compra.</p>
        <Link href={routes.events} className="mt-4 inline-block text-sm underline">
          Explorar eventos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-on-surface-variant">{businessConfig.deliveryDescription}</p>

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
          Archivados ({archivedCount})
        </button>
      </div>

      <p className="text-caption text-on-surface-variant/80">
        {view === "active"
          ? "Pedidos en curso o pendientes. Los entregados podés archivarlos para limpiar la lista."
          : "Pedidos entregados archivados. Podés restaurarlos cuando quieras."}
      </p>

      {visibleRequests.length === 0 ? (
        <p className="text-on-surface-variant">
          {view === "active" ? "No tenés pedidos activos." : "No tenés pedidos archivados."}
        </p>
      ) : (
        visibleRequests.map((req) => {
          const hint = PURCHASE_REQUEST_STATUS_HINTS[req.status]?.client;
          const eventUrl = req.events?.slug ? routes.event(req.events.slug) : null;
          const isArchived = Boolean(req.client_archived_at);

          return (
            <div key={req.id} className="flex flex-wrap gap-4 hairline-border p-4">
              {req.photos && (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden">
                  <ProtectedImage
                    src={getSecureMediaUrl(req.photos.id, "thumbnail")}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getPurchaseRequestStatusBadgeVariant(req.status)}>
                    {PURCHASE_REQUEST_STATUS_LABELS[req.status]}
                  </Badge>
                  {isArchived && <Badge variant="outline">Archivado</Badge>}
                </div>
                {req.photos && (
                  <p className="mt-1 font-mono text-sm">
                    Foto {formatPhotoNumber(req.photos.sort_order)}
                  </p>
                )}
                {eventUrl ? (
                  <Link href={eventUrl} className="mt-1 block font-medium hover:underline">
                    {req.events?.title}
                  </Link>
                ) : (
                  <p className="mt-1 font-medium">{req.events?.title}</p>
                )}
                {req.quoted_price_cents != null && req.quoted_price_cents > 0 && (
                  <p className="mt-1 font-medium">
                    {req.status === "pending" ? "Precio publicado: " : "Precio confirmado: "}
                    {formatCurrency(req.quoted_price_cents, req.currency)}
                    {req.status === "pending" && (
                      <span className="text-caption ml-1 font-normal text-on-surface-variant">
                        (pendiente de confirmación)
                      </span>
                    )}
                  </p>
                )}
                {hint && (
                  <p className="text-caption mt-2 text-on-surface-variant">{hint}</p>
                )}
              </div>
              <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-col sm:items-end">
                {req.status === "pending" && !isArchived && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancel({ requestId: req.id })}
                  >
                    Cancelar
                  </Button>
                )}
                {req.status === "completed" && !isArchived && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => archive({ requestId: req.id })}
                    isLoading={archiving}
                  >
                    <Archive className="h-4 w-4" />
                    Archivar
                  </Button>
                )}
                {isArchived && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unarchive({ requestId: req.id })}
                    isLoading={unarchiving}
                  >
                    <ArchiveRestore className="h-4 w-4" />
                    Restaurar
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
