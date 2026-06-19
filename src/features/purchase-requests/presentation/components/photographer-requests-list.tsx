"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
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
import { ProtectedImage } from "@/shared/components/protected-image";
import {
  approvePurchaseRequestAction,
  rejectPurchaseRequestAction,
  completePurchaseRequestAction,
} from "@/features/purchase-requests/presentation/actions/purchase-request.actions";
import { useState } from "react";

export function PhotographerRequestsList({
  requests,
}: {
  requests: PurchaseRequestRow[];
}) {
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, string>>({});

  const { execute: approve, isExecuting: approving } = useAction(
    approvePurchaseRequestAction,
    { onSuccess: () => router.refresh() },
  );
  const { execute: reject } = useAction(rejectPurchaseRequestAction, {
    onSuccess: () => router.refresh(),
  });
  const { execute: complete } = useAction(completePurchaseRequestAction, {
    onSuccess: () => router.refresh(),
  });

  if (requests.length === 0) {
    return <p className="text-on-surface-variant">No hay pedidos de compra.</p>;
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => {
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
            <div className="flex flex-wrap items-end gap-2">
              {req.status === "pending" && (
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
              {req.status === "approved" && (
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
            </div>
          </div>
        );
      })}
      <p className="text-caption text-on-surface-variant/70">
        {businessConfig.noPlatformFeeMessage} {businessConfig.deliveryDescription}
      </p>
    </div>
  );
}
