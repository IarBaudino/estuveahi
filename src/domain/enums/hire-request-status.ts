export const HireRequestStatus = {
  PENDING: "pending",
  CONTACTED: "contacted",
  CLOSED: "closed",
} as const;

export type HireRequestStatus =
  (typeof HireRequestStatus)[keyof typeof HireRequestStatus];

export const HIRE_REQUEST_STATUS_LABELS: Record<HireRequestStatus, string> = {
  pending: "Pendiente",
  contacted: "Contactado",
  closed: "Cerrado",
};
