"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import type { PurchaseRequestRow } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  PURCHASE_REQUEST_STATUS_LABELS,
  PURCHASE_REQUEST_STATUS_HINTS,
  getPurchaseRequestStatusBadgeVariant,
  type PurchaseRequestStatus,
} from "@/domain/enums/purchase-request-status";
import { businessConfig } from "@/config/business";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { formatCurrency } from "@/shared/lib/utils";
import { getSecureMediaUrl } from "@/shared/lib/media-url";
import { ProtectedImage } from "@/shared/components/protected-image";
import { cancelPurchaseRequestAction } from "@/features/purchase-requests/presentation/actions/purchase-request.actions";
import { routes } from "@/config/routes";
import { cn } from "@/shared/lib/utils";

const FILTER_OPTIONS: { value: "all" | PurchaseRequestStatus; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "En curso" },
  { value: "completed", label: "Entregadas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "rejected", label: "Rechazadas" },
];

export function ClientRequestsList({ requests }: { requests: PurchaseRequestRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | PurchaseRequestStatus>("all");

  const { execute: cancel } = useAction(cancelPurchaseRequestAction, {
    onSuccess: () => router.refresh(),
  });

  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

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
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs transition-colors hairline-border",
              filter === value
                ? "bg-surface-container-high font-medium"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-on-surface-variant">No hay solicitudes con este filtro.</p>
      ) : (
        filtered.map((req) => {
          const hint = PURCHASE_REQUEST_STATUS_HINTS[req.status]?.client;
          const eventUrl = req.events?.slug ? routes.event(req.events.slug) : null;

          return (
            <div key={req.id} className="flex gap-4 hairline-border p-4">
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
                <Badge variant={getPurchaseRequestStatusBadgeVariant(req.status)}>
                  {PURCHASE_REQUEST_STATUS_LABELS[req.status]}
                </Badge>
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
              {req.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancel({ requestId: req.id })}
                >
                  Cancelar
                </Button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
