"use client";

import Link from "next/link";
import type { PurchaseRequestRow } from "@/features/purchase-requests/infrastructure/purchase-request.repository";
import { Badge } from "@/shared/ui/badge";
import { formatPhotoNumber } from "@/shared/lib/photo-number";
import { formatCurrency } from "@/shared/lib/utils";
import {
  PURCHASE_REQUEST_STATUS_LABELS,
  getPurchaseRequestStatusBadgeVariant,
} from "@/domain/enums/purchase-request-status";
import { routes } from "@/config/routes";
import { getDisplayName } from "@/shared/lib/profile";
import { WhatsAppContactButton } from "@/features/purchase-requests/presentation/components/whatsapp-contact-button";
import { buildPurchaseRequestWhatsAppMessage } from "@/features/purchase-requests/presentation/lib/purchase-request-whatsapp";

export function AdminRequestsTable({
  requests,
}: {
  requests: PurchaseRequestRow[];
}) {
  if (requests.length === 0) {
    return <p className="text-on-surface-variant">No hay solicitudes registradas.</p>;
  }

  return (
    <div className="overflow-x-auto hairline-border">
      <table className="w-full text-sm">
        <thead className="border-b border-white/10 bg-surface-container">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Evento</th>
            <th className="px-4 py-3 text-left font-medium">Foto</th>
            <th className="px-4 py-3 text-left font-medium">Cliente</th>
            <th className="px-4 py-3 text-left font-medium">Precio</th>
            <th className="px-4 py-3 text-left font-medium">Estado</th>
            <th className="px-4 py-3 text-left font-medium">Fecha</th>
            <th className="px-4 py-3 text-left font-medium">WhatsApp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {requests.map((req) => {
            const whatsappMessage = buildPurchaseRequestWhatsAppMessage({
              clientFirstName: req.clients?.first_name,
              eventTitle: req.events?.title ?? "el evento",
              photoSortOrder: req.photos?.sort_order,
              quotedPriceCents: req.quoted_price_cents,
              currency: req.currency,
              clientMessage: req.message,
            });

            return (
              <tr key={req.id}>
                <td className="px-4 py-3">
                  {req.events?.slug ? (
                    <Link
                      href={routes.event(req.events.slug)}
                      className="font-medium hover:underline"
                    >
                      {req.events.title}
                    </Link>
                  ) : (
                    (req.events?.title ?? "—")
                  )}
                </td>
                <td className="px-4 py-3 font-mono">
                  {req.photos ? formatPhotoNumber(req.photos.sort_order) : "—"}
                </td>
                <td className="px-4 py-3">
                  {req.clients
                    ? getDisplayName({
                        firstName: req.clients.first_name,
                        lastName: req.clients.last_name,
                        email: req.clients.email,
                        phone: req.clients.phone,
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {req.quoted_price_cents != null && req.quoted_price_cents > 0
                    ? formatCurrency(req.quoted_price_cents, req.currency)
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getPurchaseRequestStatusBadgeVariant(req.status)}>
                    {PURCHASE_REQUEST_STATUS_LABELS[req.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(req.created_at).toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <WhatsAppContactButton
                    phone={req.clients?.phone}
                    message={whatsappMessage}
                    compact
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
