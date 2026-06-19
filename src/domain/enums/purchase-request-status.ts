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
  approved: "Aprobada",
  rejected: "Rechazada",
  completed: "Entregada",
  cancelled: "Cancelada",
};

/** Texto orientativo según el estado del flujo manual fotógrafo → cliente */
export const PURCHASE_REQUEST_STATUS_HINTS: Partial<
  Record<PurchaseRequestStatus, { client: string; photographer: string }>
> = {
  pending: {
    client: "El fotógrafo revisará tu solicitud y te enviará un precio.",
    photographer: "Cotizá la foto. El cliente pagará directamente a vos.",
  },
  approved: {
    client:
      "Coordiná el pago con el fotógrafo. Te enviará la imagen en alta por el canal acordado.",
    photographer:
      "Cobrá al cliente por tu cuenta y enviá la imagen en alta. Luego marcá como entregada.",
  },
  completed: {
    client: "El fotógrafo confirmó la entrega de tu foto en alta resolución.",
    photographer: "Entrega confirmada. El 100 % de la venta es tuyo.",
  },
};
