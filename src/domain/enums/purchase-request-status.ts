export const PurchaseRequestStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type PurchaseRequestStatus =
  (typeof PurchaseRequestStatus)[keyof typeof PurchaseRequestStatus];

export const PURCHASE_REQUEST_STATUS_LABELS: Record<
  PurchaseRequestStatus,
  string
> = {
  pending: "Pendiente",
  approved: "En curso",
  rejected: "Rechazada",
  completed: "Entregada",
  cancelled: "Cancelada",
};

export function getPurchaseRequestStatusBadgeVariant(
  status: PurchaseRequestStatus,
): "default" | "success" | "warning" | "destructive" | "outline" {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "outline";
    case "completed":
      return "success";
    case "rejected":
    case "cancelled":
      return "destructive";
    default:
      return "default";
  }
}

/** Texto orientativo según el estado del flujo manual fotógrafo → cliente */
export const PURCHASE_REQUEST_STATUS_HINTS: Partial<
  Record<PurchaseRequestStatus, { client: string; photographer: string }>
> = {
  pending: {
    client:
      "Tu pedido fue enviado. La fotografx lo revisará y te confirmará el precio o aceptará el publicado.",
    photographer:
      "Nuevo pedido. Cotizá la foto o aceptá el precio publicado en la galería.",
  },
  approved: {
    client:
      "Precio confirmado. Coordiná el pago con la fotografx; te enviará la imagen en alta por el canal acordado.",
    photographer:
      "Pedido aceptado. Cobrá al cliente y enviá la foto en alta. Recién después marcá como entregada.",
  },
  completed: {
    client: "La fotografx confirmó que te envió la foto en alta resolución.",
    photographer: "Entrega confirmada. El 100 % de la venta es tuyo.",
  },
};
