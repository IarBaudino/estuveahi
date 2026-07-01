"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import type { PurchaseRequestRow } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { Badge } from "@/shared/ui/badge";
import { PURCHASE_REQUEST_STATUS_LABELS, getPurchaseRequestStatusBadgeVariant } from "@/domain/enums/purchase-request-status";
import { businessConfig } from "@/config/business";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { getDisplayName } from "@/shared/lib/profile";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { formatCurrency } from "@/shared/lib/utils";
import { cn } from "@/shared/lib/utils";
import { ProtectedImage } from "@/shared/components/protected-image";
import { PhotographerRequestDetailDialog } from "@/features/purchase-requests/presentation/components/photographer-request-detail-dialog";

type ViewFilter = "active" | "archived";

export function PhotographerRequestsList({
  requests,
}: {
  requests: PurchaseRequestRow[];
}) {
  const router = useRouter();
  const [view, setView] = useState<ViewFilter>("active");
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequestRow | null>(null);

  const refresh = () => router.refresh();

  useEffect(() => {
    if (!selectedRequest) return;
    const updated = requests.find((req) => req.id === selectedRequest.id);
    if (updated) setSelectedRequest(updated);
  }, [requests, selectedRequest?.id]);

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
          Archivados ({archivedCount})
        </button>
      </div>

      <p className="text-caption text-on-surface-variant/80">
        {view === "active"
          ? "Solo ves pedidos de fotos que subiste vos. Los entregados podés archivarlos para limpiar la lista."
          : "Pedidos entregados archivados. Podés restaurarlos o eliminarlos definitivamente."}
      </p>

      {visibleRequests.length === 0 ? (
        <p className="text-on-surface-variant">
          {view === "active" ? "No tenés pedidos activos." : "No tenés pedidos archivados."}
        </p>
      ) : (
        visibleRequests.map((req) => {
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
            <button
              key={req.id}
              type="button"
              onClick={() => setSelectedRequest(req)}
              className="flex w-full flex-wrap gap-4 hairline-border p-4 text-left transition-colors hover:bg-surface-container-high"
            >
              {req.photos && (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
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
                  <Badge variant={getPurchaseRequestStatusBadgeVariant(req.status)}>
                    {PURCHASE_REQUEST_STATUS_LABELS[req.status]}
                  </Badge>
                  {isArchived && <Badge variant="outline">Archivado</Badge>}
                  {req.photos && (
                    <span className="font-mono text-sm">
                      Foto {formatPhotoNumber(req.photos.sort_order)}
                    </span>
                  )}
                  <span className="text-sm text-on-surface-variant">
                    {req.events?.title}
                  </span>
                </div>

                <p className="mt-2 font-medium">{clientName}</p>
                {req.message && (
                  <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">
                    &quot;{req.message}&quot;
                  </p>
                )}
                {req.quoted_price_cents != null && req.quoted_price_cents > 0 && (
                  <p className="mt-2 font-medium">
                    {formatCurrency(req.quoted_price_cents, req.currency)}
                  </p>
                )}
              </div>
              <div className="flex w-full items-center justify-end sm:w-auto sm:self-center">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  <Eye className="h-4 w-4" />
                  Ver pedido
                </span>
              </div>
            </button>
          );
        })
      )}

      <p className="text-caption text-on-surface-variant/70">
        {businessConfig.noPlatformFeeMessage} {businessConfig.photographerDeliveryNote}
      </p>

      {selectedRequest && (
        <PhotographerRequestDetailDialog
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdated={refresh}
        />
      )}
    </div>
  );
}
